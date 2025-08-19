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
    mutation DeleteComponent($componentId: String!) {
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