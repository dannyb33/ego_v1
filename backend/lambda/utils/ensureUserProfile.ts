import { UserProfile, UserProfileSchema } from '../users/types'
import { ddb } from '../../clients/ddb'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export async function ensureUserProfile(identity: Record<string, any>): Promise<UserProfile> {
    if (!identity) {
        throw new Error("Invalid identity: missing identity");
    }

    const sub = identity.sub;
    if (!sub) {
        throw new Error("Invalid identity: missing sub");
    }

    const TABLE_NAME = process.env.TABLE_NAME!;

    const key = {
        PK: `USER#${sub}`,
        SK: 'PROFILE'
    };

    const getCmd = new GetCommand({
        TableName: TABLE_NAME,
        Key: key,
    });

    const getResp = await ddb.send(getCmd);

    if(getResp.Item) {
        const parsed = UserProfileSchema.safeParse(getResp.Item);
        if (!parsed.success) {
            throw new Error("Invalid user profile data in DB");
        }

        return parsed.data;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
        PK: key.PK,
        SK: key.SK,
        username: identity.username,
        displayName: identity.username,
        bio: "",
        followingCount: 0,
        followerCount: 0,
        postCount: 0,
        createdAt: now,
        updatedAt: now
    }

    const putCmd = new PutCommand({
        TableName: TABLE_NAME,
        Item: newProfile,
    });

    await ddb.send(putCmd);

    return newProfile;
}

