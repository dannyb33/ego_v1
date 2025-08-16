import { UserProfile, UserProfileSchema, Page, PageSchema, BioComponent } from '../users/types'
import { ddb } from '../../clients/ddb'
import { BatchGetCommand, BatchWriteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DEFAULT_COLOR, DEFAULT_FONT, DEFAULT_SECTIONS } from './global-types';
import { User } from 'aws-cdk-lib/aws-iam';
import { create } from 'domain';
import crypto from "crypto";

export async function ensureUserProfile(identity: Record<string, any>): Promise<UserProfile> {
    if (!identity) {
        throw new Error("Invalid identity: missing identity");
    }

    if (!identity?.sub) {
        throw new Error("Invalid identity: missing sub");
    }

    const sub = identity.sub;
    const TABLE_NAME = process.env.TABLE_NAME!;
    const now = new Date().toISOString();

    const profileKey = {
        PK: `USER#${sub}`,
        SK: 'PROFILE'
    };

    const pageKey = {
        PK: `USER#${sub}`,
        SK: 'PAGE#home'
    }

    const bioKey = {
        PK: `USER#${sub}`,
        SK: `PAGE#COMPONENT#${crypto.randomUUID()}`
    }

    const batchGetCmd = new BatchGetCommand({
        RequestItems: {
            [TABLE_NAME]: {
                Keys: [profileKey, pageKey, bioKey]
            }
        }
    });

    try {
        const getResp = await ddb.send(batchGetCmd);
        const items = getResp.Responses?.[TABLE_NAME] || [];

        const existingProfile = items.find(item => item.SK === 'PROFILE');
        const existingPage = items.find(item => item.SK === 'PAGE#home');
        const existingBio = items.find(item => item.SK === bioKey.SK);

         if (existingProfile) {
            const parsed = UserProfileSchema.safeParse(existingProfile);
            if (!parsed.success) {
                throw new Error(`Invalid user profile data in DB: ${parsed.error.message}`);
            }
            return parsed.data;
        }

        const toCreate = [];

        const newProfile: UserProfile = createUserProfile(profileKey, identity, now);
        toCreate.push({ PutRequest: { Item: newProfile }});

        if (!existingPage) {
            const newPage: Page = {
                PK: pageKey.PK,
                SK: pageKey.SK,
                createdAt: now,
                updatedAt: now,
                sectionCount: DEFAULT_SECTIONS,
                backgroundType: "COLOR",
                backgroundColor: DEFAULT_COLOR,
                font: DEFAULT_FONT,
                entityType: "PAGE",
            };
            toCreate.push({
                PutRequest: { Item: newPage }
            });
        }

        if (!existingBio) {
            const bioSection: BioComponent = {
                PK: bioKey.PK,
                SK: bioKey.SK,
                createdAt: now,
                updatedAt: now,
                order: 0,
                componentType: "BIO",
                username: identity.username,
                displayName: identity.username,
                bio: "",
                followingCount: 0,
                followerCount: 0,
                postCount: 0,
                entityType: "COMPONENT"
            };
            toCreate.push({
                PutRequest: { Item: bioSection }
            })
        }

        // Create missing items if any
        if (toCreate.length > 0) {
            const batchWriteCmd = new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: toCreate
                }
            });
            await ddb.send(batchWriteCmd);
        }

        return newProfile;

    } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid user profile')) {
            throw error;
        }
        throw new Error(`Failed to ensure user profile: ${error}`);
    }
}

function createUserProfile(profileKey: {PK: string, SK: string}, identity: any, timestamp: string): UserProfile {
    return {
        PK: profileKey.PK,
        SK: profileKey.SK,
        GSI1PK: `USER`,
        GSI1SK: `${identity.username}`,
        username: identity.username,
        displayName: identity.username,
        bio: "",
        followingCount: 0,
        followerCount: 0,
        postCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        entityType: "PROFILE"
    };
}

