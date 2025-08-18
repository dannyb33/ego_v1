import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ensureUserProfile } from "../utils/ensureUserProfile";
import { BasePost, TextPost } from "./types";
import { ddb } from "../../clients/ddb";
import crypto from "crypto";

const TABLE_NAME = process.env.TABLE_NAME!;

type BasePostResponse = Omit<BasePost, 'PK' | 'SK' | 'entityType'> & {
    __typename: "BasePost"
    uuid: String
}

type TextPostResponse = Omit<TextPost, 'PK' | 'SK' | 'entityType'> & {
    __typename: "TextPost"
    uuid: String
}

type PostResponse = BasePostResponse | TextPostResponse;

export const handler = async (event: any) => {
    const fieldName = event.info.fieldName;
    const sub = event.identity?.sub;
    if(!sub) {
        throw new Error("Unauthorized");
    }

    const user = await ensureUserProfile(event.identity);

    switch(fieldName) {
        case 'getCurrentPosts':
            return await getUserPosts(sub);
        case 'getUserPosts':
            return await getUserPosts(event.arguments.sub);
        case 'createTextPost':
            return await createTextPost(sub, event.arguments.text);
        default:
            throw new Error("Lambda unhandled")
    }

};

const getUserPosts = async(sub: any) => {
    try {
        const postData = await ddb.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :postPrefix)',
            ExpressionAttributeValues: {
                ':pk': `USER#${sub}`,
                ':postPrefix': 'POST#'
            }
        }));

        const items = postData.Items || [];

        const posts = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        const out: PostResponse[] = []

        for (const post of posts) {
            out.push(formatPost(post));
        }

        return out;
    } catch (error) {
        throw new Error(`Failed to get posts: ${error}`);
    }
}

const createTextPost = async(sub: any, text: string) => {
    try {
        const userData = await ddb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `PROFILE`
            }
        }));

        const user = userData.Item;

        if (!user) {
            throw new Error("User not found");
        }

        const now = new Date().toISOString();
        
        const newPost: TextPost = {
            PK: `USER#${sub}`,
            SK: `POST#${crypto.randomUUID()}`,
            createdAt: now,
            updatedAt: now,
            entityType: "POST",
            username: user.username,
            displayName: user.displayName,
            postType: "TEXT",
            text: text
        }

        const putCmd = new PutCommand({
            TableName: TABLE_NAME,
            Item: newPost
        });

        await ddb.send(putCmd);

        return formatPost(newPost);
    } catch (error) {
        throw new Error(`Failed to create text post: ${error}`);
    }
}

function formatPost(post: Record<string, any>) {
    const basePost = {
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        username: post.username,
        displayName: post.displayName,
        postType: post.postType,
        uuid: post.SK.split("#")[1]
    }

    let out: PostResponse;

    switch (post.postType) {
        case ("TEXT"):
            out = {
                ...basePost,
                __typename: "TextPost",
                text: post.text
            }
            return out;
        default:
            out = {
                ...basePost,
                __typename: "BasePost",
            }
            return out;
    }
}

