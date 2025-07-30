import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ensureUserProfile } from "../utils/ensureUserProfile";
import { ddb } from "../../clients/ddb"

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
    const fieldName = event.info.fieldName;
    const sub = event.identity?.sub;
    if(!sub) {
        throw new Error("Unauthorized");
    }

    const user = await ensureUserProfile(event.identity);

    switch(fieldName) {
        case 'getUser':
            return await getUser(event);
        default:
            throw new Error("Lambda unhandled")
    }

};

const getUser = async(event: any) => {
    const key = {
        PK: `USER#${event.identity.sub}`,
        SK: 'PROFILE',
    }

    const getCmd = new GetCommand({
        TableName: TABLE_NAME,
        Key: key
    });

    const response = await ddb.send(getCmd);

    if (!response.Item) {
        throw new Error("User not found")
    }

    const item = response.Item;

    const userProfile = {
        sub: item.PK.replace(/^USER#/, ""), // extract sub from PK
        username: item.username,
        displayName: item.displayName,
        bio: item.bio,
        followingCount: Number(item.followingCount),
        followerCount: Number(item.followerCount),
        postCount: Number(item.postCount),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };

    return userProfile;
}