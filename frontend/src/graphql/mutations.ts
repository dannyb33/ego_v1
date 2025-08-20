export const ADD_COMPONENT = `
    mutation AddComponent($type: ComponentType!) {
        addPageComponent(type: $type) {
            componentCount
            components {
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
            page {
                backgroundColor
                backgroundImage
                backgroundType
                createdAt
                font
                sectionCount
                updatedAt
            }
            totalSections
        }
    }
`;

export const DELETE_COMPONENT = `
    mutation DeleteComponent($componentId: ID!) {
        removePageComponent(componentId: $componentId) {
            componentCount
            components {
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
            page {
                backgroundColor
                backgroundImage
                backgroundType
                createdAt
                font
                sectionCount
                updatedAt
            }
            totalSections
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