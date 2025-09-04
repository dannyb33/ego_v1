export const ADD_COMPONENT = `
    mutation AddComponent($type: ComponentType!) {
        addPageComponent(type: $type) {
                componentType
                createdAt
                order
                updatedAt
                uuid
            ... on TextComponent {
                __typename
                font
                backgroundColor
                text
            }
            ... on BioComponent {
                __typename
                username
                displayName
                bio
                followingCount
                followerCount
                postCount
            }
        }
    }
`;

export const DELETE_COMPONENT = `
    mutation DeleteComponent($componentId: ID!) {
        removePageComponent(componentId: $componentId) {
            componentType
                createdAt
                order
                updatedAt
                uuid
            ... on TextComponent {
                __typename
                font
                backgroundColor
                text
            }
            ... on BioComponent {
                __typename
                username
                displayName
                bio
                followingCount
                followerCount
                postCount
            }
        }
    }
`;

export const EDIT_COMPONENT = `
    mutation EditComponent($componentId: ID!, $updates: ComponentUpdateInput!) {
        editPageComponent(componentId: $componentId, updates: $updates) {
            componentType
                createdAt
                order
                updatedAt
                uuid
            ... on TextComponent {
                __typename
                font
                backgroundColor
                text
            }
            ... on BioComponent {
                __typename
                username
                displayName
                bio
                followingCount
                followerCount
                postCount
            }
        }
    }
`;

export const FOLLOW_USER = `
    mutation FollowUser($userId: ID!) {
        followUser(userId: $userId) {
            bio
            createdAt
            displayName
            followerCount
            followingCount
            postCount
            updatedAt
            username
            uuid
        }
    }
`;

export const UNFOLLOW_USER = `
    mutation UnfollowUser($userId: ID!) {
        unfollowUser(userId: $userId) {
            bio
            createdAt
            displayName
            followerCount
            followingCount
            postCount
            updatedAt
            username
            uuid
        }
    }
`;

export const CREATE_TEXT_POST = `
    mutation CreateTextPost($text: String!) {
        createTextPost(text: $text) {
            createdAt
            displayName
            postType
            updatedAt
            username
            uuid
            ... on TextPost {
            __typename
            text
            }
        }
    }
`;

export const CREATE_IMAGE_POST = `
    mutation CreateImagePost($imageUrl: String!, $text: String!) {
        createImagePost(imageUrl: $imageUrl, text: $text) {
            createdAt
            displayName
            postType
            updatedAt
            username
            uuid
            ... on ImagePost {
            __typename
            text
            imageUrl
            }
        }
    }
`;