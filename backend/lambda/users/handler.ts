import { BatchWriteCommand, DeleteCommand, GetCommand, PutCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ensureUserProfile } from "../utils/ensureUserProfile";
import { ddb } from "../../clients/ddb"
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Component, Page, BaseComponent, BioComponent, TextComponent, ComponentType, UserProfile, FollowingObject, FollowerObject, ComponentUpdateInput, ComponentSchemas } from "./types";
import { DEFAULT_COLOR, DEFAULT_FONT, DEFAULT_SECTIONS } from "../utils/global-types";
import crypto from "crypto";

const TABLE_NAME = process.env.TABLE_NAME!;

type UserResponse = Omit<UserProfile, 'PK' | 'SK' | 'entityType' | 'GSI1PK' | 'GSI1SK'> & {
    uuid: string;
};

type PageResponse = Omit<Page, 'PK' | 'SK' | 'entityType'>;

type BaseComponentResponse = Omit<BaseComponent, 'PK' | 'SK' | 'entityType'> & {
    __typename: 'BaseComponent';
    uuid: string;
};
type BioComponentResponse = Omit<BioComponent, 'PK' | 'SK' | 'entityType'> & {
    __typename: 'BioComponent';
    uuid: string;
};
type TextComponentResponse = Omit<TextComponent, 'PK' | 'SK' | 'entityType'> & {
    __typename: 'TextComponent'
    uuid: string;
};

type ComponentResponse = BaseComponentResponse | BioComponentResponse | TextComponentResponse;

type FollowingResponse = Omit<FollowingObject, 'PK' | 'SK' | 'entityType'>;

export const handler = async (event: any) => {
    const fieldName = event.info.fieldName;
    const sub = event.identity?.sub;
    if(!sub) {
        throw new Error("Unauthorized");
    }

    const user = await ensureUserProfile(event.identity);

    switch(fieldName) {
        case 'getCurrentUser':
            return await getUser(sub);
        case 'getUser':
            return await getUser(event.arguments.sub);
        case 'searchUsers':
            return await searchUsers(event.arguments.query);
        
        case 'getUsersFollowed':
            return await getUsersFollowed(sub);

        case 'getCurrentPage':
            return await getPage(sub);
        case 'getPage':
            return await getPage(event.arguments.sub);
        case 'addPageComponent':
            return await addComponent(sub, event.arguments.type);
        case 'removePageComponent':
            return await removeComponent(sub, event.arguments.componentId);
        case 'movePageComponent':
            return await moveComponent(sub, event.arguments.componentId, event.arguments.newOrder);
        case 'editPageComponent':
            return await editComponent(sub, event.arguments.componentId, event.arguments.updates);
        
        case 'followUser':
            return await followUser(sub, event.arguments.userId);
        case 'unfollowUser':
            return await unfollowUser(sub, event.arguments.userId);
        default:
            throw new Error("Lambda unhandled")
    }

};

const getUser = async(sub: any) => {
    try {
        const key = {
            PK: `USER#${sub}`,
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
            uuid: item.PK.split('#')[1],
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
    } catch (error) {
        throw new Error(`Failed to get user: ${error}`);
    }
}

const searchUsers = async(query: string) => {
    try {
        const queryCmd = new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI1",
            KeyConditionExpression: "GSI1PK = :userPrefix AND begins_with(GSI1SK, :prefix)",
            ExpressionAttributeValues: {
                ":userPrefix": "USER",
                ":prefix": query
            }
        })

        const response = await ddb.send(queryCmd);

        const userList = response.Items || [];
        const outList: UserResponse[] = [];

        for(const item of userList) {
            outList.push({
                uuid: item.PK.split('#')[1],
                username: item.username,
                displayName: item.displayName,
                bio: item.bio,
                followingCount: Number(item.followingCount),
                followerCount: Number(item.followerCount),
                postCount: Number(item.postCount),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            });
        }

        return outList;

    } catch (error) {
        throw new Error(`Error searching: ${error}`)
    }
}

const getPage = async(sub: any) => {
    try {
        const profile = await getUser(sub);

        const pageResponse = await queryPage(sub);

        const pageInfoItem = pageResponse.pageInfo;
        const componentItems = pageResponse.componentList;

        const pageInfo: PageResponse = {
            createdAt: pageInfoItem.createdAt,
            updatedAt: pageInfoItem.updatedAt,
            sectionCount: pageInfoItem.sectionCount,
            backgroundType: pageInfoItem.backgroundType,
            backgroundColor: pageInfoItem.backgroundColor,
            backgroundImage: pageInfoItem.backgroundImage ? String(pageInfoItem.backgroundImage) : undefined,
            font: pageInfoItem.font
        }

        const components: ComponentResponse[] = [];

        for (const item of componentItems) {
            const formatted = formatComponent(item)

            if (formatted.__typename === "BioComponent") {
                components.push({
                    ...formatted,
                    displayName: profile.displayName,
                    bio: profile.bio,
                    followingCount: profile.followingCount,
                    followerCount: profile.followerCount,
                    postCount: profile.postCount
                });
            } else {
                components.push(formatComponent(item));
            }
        }

        return {
            page: pageInfo,
            components: components,
            componentCount: components.length,
            totalSections: pageInfo.sectionCount
        }

    } catch (error) {
        throw new Error(`Failed to get page: ${error}`);
    }
}

const addComponent = async(sub: any, type: ComponentType) => {
    try {
        const pageResponse = await queryPage(sub);

        const pageInfoItem = pageResponse.pageInfo;
        const componentItems = pageResponse.componentList;
        const maxOrder = pageResponse.maxOrder;
        const newOrder = maxOrder + 10;

        // if (componentItems.length >= pageInfoItem.sectionCount) {
        //     throw new Error('Maximum components reached');
        // }

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

        let newComponent: Component;

        switch (String(type)) {
            case "BIO":
                newComponent = {
                    PK: user.PK,
                    SK: `PAGE#COMPONENT#${crypto.randomUUID()}`,
                    createdAt: now,
                    updatedAt: now,
                    order: newOrder,
                    componentType: "BIO",
                    username: user.username,
                    displayName: user.displayName,
                    bio: user.bio,
                    followingCount: user.followingCount,
                    followerCount: user.followerCount,
                    postCount: user.postCount,
                    entityType: "COMPONENT"
                };
                break
            case "TEXT":
                newComponent = {
                    PK: user.PK,
                    SK: `PAGE#COMPONENT#${crypto.randomUUID()}`,
                    createdAt: now,
                    updatedAt: now,
                    order: newOrder,
                    componentType: "TEXT",
                    font: DEFAULT_FONT,
                    backgroundColor: DEFAULT_COLOR,
                    text: "",
                    entityType: "COMPONENT" 
                };
                break
            default:
                newComponent = {
                    PK: user.PK,
                    SK: `PAGE#COMPONENT#${crypto.randomUUID()}`,
                    createdAt: now,
                    updatedAt: now,
                    order: newOrder,
                    componentType: "TEXT",
                    font: DEFAULT_FONT,
                    backgroundColor: DEFAULT_COLOR,
                    text: "",
                    entityType: "COMPONENT" 
                };
                break
        };

        const putCmd = new PutCommand({
            TableName: TABLE_NAME,
            Item: newComponent
        });

        await ddb.send(putCmd);

        return getPage(sub);

    } catch (error) {
        throw new Error(`Error adding component: ${error}`);
    }
}

const removeComponent = async(sub: any, componentId: string) => {
    try {
        const deleteCmd = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `PAGE#COMPONENT#${componentId}`
            }
        });

        const delResponse = await ddb.send(deleteCmd);

        return getPage(sub);

    } catch (error) {
        throw new Error(`Error when deleting component: ${error}`);
    }
}

const moveComponent = async(sub: any, componentId: string, newOrder: number) => {
    try {
        const updateCmd = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `PAGE#COMPONENT#${componentId}`
            },
            UpdateExpression: "SET #order = :newOrder, updatedAt = :now",
            ExpressionAttributeNames: {
                "#order": "order"
            },
            ExpressionAttributeValues: {
                ":newOrder": newOrder,
                ":now": new Date().toISOString()
            }
        });

        await ddb.send(updateCmd);

        return getPage(sub);
    } catch (error) {
        throw new Error(`Error moving component: ${error}`);
    }
}

const editComponent = async(sub: any, componentId: string, updates: ComponentUpdateInput) => {
    try {
        const componentData = await ddb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `PAGE#COMPONENT#${componentId}`
            }
        }));

        const now = new Date().toISOString();

        const component = componentData.Item;

        if (!component) throw new Error("Component not found");

        const schema = ComponentSchemas[component.componentType];
        if (!schema) throw new Error("Unknown component type");

        const validated = schema.parse({ ...component, ...updates});

        const updateExpressions: string[] = [];
        const expressionAttrNames: Record<string, string> = {};
        const expressionAttrValues: Record<string, any> = {};

        let i = 0;
        for (const [field, value] of Object.entries(updates)) {
            i++;
            const attrName = `#f${i}`;
            const attrValue = `:v${i}`;

            updateExpressions.push(`${attrName} = ${attrValue}`);
            expressionAttrNames[attrName] = field;
            expressionAttrValues[attrValue] = value;
        }

        updateExpressions.push(`#updatedAt = :updatedAt`);
        expressionAttrNames['#updatedAt'] = 'updatedAt';
        expressionAttrValues[':updatedAt'] = now;

        const updateCmd = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `PAGE#COMPONENT#${componentId}`
            },
            UpdateExpression: `SET ${updateExpressions.join(", ")}`,
            ExpressionAttributeNames: expressionAttrNames,
            ExpressionAttributeValues: expressionAttrValues,
            ReturnValues: "ALL_NEW",
        });

        const result = await ddb.send(updateCmd);

        return getPage(sub);

    } catch (error) {
        throw new Error(`Error updating component: ${error}`);
    }
}

const getUsersFollowed = async(sub: any) => {
    try {
        const queryCmd = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: `PK = :pk AND begins_with(SK, :followingPrefix)`,
            ExpressionAttributeValues: {
                ':pk': `USER#${sub}`,
                ':followingPrefix': `FOLLOWING#`
            }
        });

        const response = await ddb.send(queryCmd);

        const following = response.Items || [];

        const followingOut: FollowingResponse[] = following.map((f) => ({
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
            followingUsername: f.followingUsername,
            followingDisplayName: f.followingDisplayName,
            followingSub: f.followingSub
        }));

        return followingOut;
        
    } catch (error) {
        throw new Error(`Unable to get following: ${error}`);
    }
}

const followUser = async(sub: any, userId: string) => {
    try {
        const followData = await ddb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `FOLLOWING#${userId}`
            }
        }));
        
        const isFollowing = followData.Item;
        if(isFollowing) {
            throw new Error("User already followed");
        }

        const user = await getUser(userId);

        const now = new Date().toISOString();

        const followingDoc: FollowingObject = {
            PK: `USER#${sub}`,
            SK: `FOLLOWING#${userId}`,
            createdAt: now,
            updatedAt: now,
            entityType: "FOLLOWING",
            followingUsername: user.username,
            followingDisplayName: user.displayName,
            followingSub: user.uuid
        };

        const followerDoc: FollowerObject = {
            PK: `USER#${userId}`,
            SK: `FOLLOWER#${sub}`,
            createdAt: now,
            updatedAt: now,
            entityType: "FOLLOWER",
            followerUsername: user.username,
            followerDisplayName: user.displayName,
            followerSub: user.uuid
        };

        await ddb.send(
            new TransactWriteCommand({
                TransactItems: [
                    { Put: { TableName: TABLE_NAME, Item: followingDoc } },
                    { Put: { TableName: TABLE_NAME, Item: followerDoc } },
                    { Update: {
                        TableName: TABLE_NAME,
                        Key: { PK: `USER#${sub}`, SK: 'PROFILE' },
                        UpdateExpression: 'SET followingCount = if_not_exists(followingCount, :zero) + :inc',
                        ExpressionAttributeValues: { ':inc': 1, ':zero': 0 }
                    }},
                    { Update: {
                        TableName: TABLE_NAME,
                        Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
                        UpdateExpression: 'SET followerCount = if_not_exists(followerCount, :zero) + :inc',
                        ExpressionAttributeValues: { ':inc': 1, ':zero': 0 }
                    }}
                ]
            })
        );

        user.followerCount = user.followerCount + 1;

        return user;
        
    } catch (error) {
        throw new Error(`Unable to follow user: ${error}`);
    }
}

const unfollowUser = async(sub: any, userId: string) => {
    try {
        const followData = await ddb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${sub}`,
                SK: `FOLLOWING#${userId}`
            }
        }));

        const isFollowing = followData.Item;
        if(!isFollowing) {
            throw new Error("User not already followed");
        }

        const followingKey = { PK: `USER#${sub}`, SK: `FOLLOWING#${userId}` };
        const followerKey = { PK: `USER#${userId}`, SK: `FOLLOWER#${sub}` };

        await ddb.send(
            new TransactWriteCommand({
            TransactItems: [
                // Delete FOLLOWING doc
                { Delete: { TableName: TABLE_NAME, Key: followingKey } },

                // Delete FOLLOWER doc
                { Delete: { TableName: TABLE_NAME, Key: followerKey } },

                // Decrement current user's followingCount
                {
                Update: {
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${sub}`, SK: 'PROFILE' },
                    UpdateExpression: 'SET followingCount = if_not_exists(followingCount, :zero) - :dec',
                    ExpressionAttributeValues: { ':dec': 1, ':zero': 0 },
                },
                },

                // Decrement target user's followerCount
                {
                Update: {
                    TableName: TABLE_NAME,
                    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
                    UpdateExpression: 'SET followerCount = if_not_exists(followerCount, :zero) - :dec',
                    ExpressionAttributeValues: { ':dec': 1, ':zero': 0 },
                },
                },
            ],
            })
        );

        return getUser(userId);
        
    } catch (error) {
        throw new Error(`Failed to unfollow user: ${error}`)
    }
}

function formatComponent(component: Record<string, any>) {
        const baseComponent = {
                createdAt: component.createdAt,
                updatedAt: component.updatedAt,
                order: component.order,
                componentType: component.componentType,
                uuid: component.SK.split("PAGE#COMPONENT#")[1],
        }

        let out: ComponentResponse;
        
        switch (component.componentType) {
            case "BIO":
                out = {
                    ...baseComponent,
                    __typename: "BioComponent",
                    username: component.username,
                    displayName: component.displayName,
                    bio: component.bio,
                    followingCount: component.followingCount,
                    followerCount: component.followerCount,
                    postCount: component.postCount
                }
                return out;
            case "TEXT":
                out = {
                    ...baseComponent,
                    __typename: "TextComponent",
                    font: component.font,
                    backgroundColor: component.backgroundColor,
                    text: component.text
                }
                return out;
            default:
                out = {
                    ...baseComponent,
                    __typename: "BaseComponent"
                }
                return out;
        }
}

async function queryPage(sub: any) {
    const queryCmd = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :pagePrefix)',
            ExpressionAttributeValues: {
                ':pk': `USER#${sub}`,
                ':pagePrefix': 'PAGE#',
            },
        });

    const response = await ddb.send(queryCmd);
    const items = response.Items || [];

    const pageInfoItem = items.find(item => String(item.SK) === `PAGE#home`);
    if (!pageInfoItem) {
        throw new Error('Page not found');
    }

    const componentItems = items
        .filter(item => String(item.SK).startsWith('PAGE#COMPONENT#'))
        .sort((a, b) => a.order - b.order);

    const maxOrder = items.reduce((max, item) => Math.max(max, item.order || 0), 0);
    const newOrder = maxOrder + 10;

    return {'pageInfo': pageInfoItem, 'componentList': componentItems, 'maxOrder': maxOrder};
}