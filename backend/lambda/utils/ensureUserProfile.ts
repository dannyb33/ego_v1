import { UserProfile, UserProfileSchema, Page, PageSchema } from '../users/types'
import { ddb } from '../../clients/ddb'
import { BatchGetCommand, BatchWriteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DEFAULT_COLOR, DEFAULT_FONT, DEFAULT_SECTIONS } from './global-types';

export async function ensureUserProfile(identity: Record<string, any>): Promise<UserProfile> {
    if (!identity) {
        throw new Error("Invalid identity: missing identity");
    }

    const sub = identity.sub;
    if (!sub) {
        throw new Error("Invalid identity: missing sub");
    }

    const TABLE_NAME = process.env.TABLE_NAME!;

    const profileKey = {
        PK: `USER#${sub}`,
        SK: 'PROFILE'
    };

    const pageKey = {
        PK: `USER#${sub}`,
        SK: 'PAGE#home'
    }

    const batchGetCmd = new BatchGetCommand({
        RequestItems: {
            [TABLE_NAME]: {
                Keys: [profileKey, pageKey]
            }
        }
    });

    const getResp = await ddb.send(batchGetCmd);
    const items = getResp.Responses?.[TABLE_NAME] || [];

    const existingProfile = items.find(item => item.SK === 'PROFILE');
    const existingPage = items.find(item => item.SK === 'PAGE#home');

    if(existingProfile && existingPage) {
        const parsed = UserProfileSchema.safeParse(existingProfile);
        if (!parsed.success) {
            throw new Error("Invalid user profile data in DB");
        }

        return parsed.data;
    }

    const now = new Date().toISOString();
    const toCreate = [];

    if (!existingProfile) {
        const newProfile: UserProfile = {
            PK: profileKey.PK,
            SK: profileKey.SK,
            username: identity.username,
            displayName: identity.username,
            bio: "",
            followingCount: 0,
            followerCount: 0,
            postCount: 0,
            createdAt: now,
            updatedAt: now,
            entityType: "PROFILE"
        };
        toCreate.push({
            PutRequest: { Item: newProfile }
        });
    }

    if (!existingPage) {
        const newPage: Page = {
            PK: pageKey.PK,
            SK: pageKey.SK,
            createdAt: now,
            updatedAt: now,
            sectionCount: DEFAULT_SECTIONS,
            backgroundType: "color",
            backgroundColor: DEFAULT_COLOR,
            font: DEFAULT_FONT,
            entityType: "PAGE",
        };
        toCreate.push({
            PutRequest: { Item: newPage }
        });
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

    if (existingProfile) {
        const parsed = UserProfileSchema.safeParse(existingProfile);
        if (!parsed.success) {
            throw new Error("Invalid user profile data in DB");
        }
        return parsed.data;
    } else {
        // Return the newly created profile
        const newProfile: UserProfile = {
            PK: profileKey.PK,
            SK: profileKey.SK,
            username: identity.username,
            displayName: identity.username,
            bio: "",
            followingCount: 0,
            followerCount: 0,
            postCount: 0,
            createdAt: now,
            updatedAt: now,
            entityType: "PROFILE"
        };
        return newProfile;
    }
}

