export const GET_CURRENT_PAGE = `
  query GetCurrentPage {
    getCurrentPage {
      componentCount
      components {
        createdAt
        componentType
        order
        updatedAt
        uuid
        ... on BioComponent {
          __typename
          username
          displayName
          bio
          followingCount
          followerCount
          postCount
        }
        ... on TextComponent {
          __typename
          font
          backgroundColor
          text
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

export const GET_PAGE = `
  query GetPage($sub: ID!) {
    getPage(sub: $sub) {
      componentCount
      components {
        createdAt
        componentType
        order
        updatedAt
        uuid
        ... on BioComponent {
          __typename
          username
          displayName
          bio
          followingCount
          followerCount
          postCount
        }
        ... on TextComponent {
          __typename
          font
          backgroundColor
          text
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

export const GET_CURRENT_USER = `
  query GetCurrentUser {
    getCurrentUser {
      uuid
      username
      displayName
      bio
      followingCount
      followerCount
      postCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_CURRENT_POSTS = `
query GetCurrentPosts {
  getCurrentPosts {
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

export const GET_USER_POSTS = `
query GetUserPosts($sub: ID!) {
  getUserPosts(sub: $sub) {
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

export const SEARCH_USERS = `
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      uuid
      username
      displayName
      bio
      followerCount
      followingCount
      postCount
      createdAt
      updatedAt
    }
  }
`;