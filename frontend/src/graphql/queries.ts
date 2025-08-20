export const GET_USER = `
  query GetUser($sub: ID = "") {
    getUser(sub: $sub) {
      bio
      createdAt
      displayName
      followerCount
      followingCount
      postCount
      updatedAt
      uuid
      username
    }
  }
`;

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

export const GET_USERS_FOLLOWED = `
  query GetUsersFollowed {
    getUsersFollowed {
      createdAt
      followingDisplayName
      followingSub
      followingUsername
      updatedAt
    }
  }
`;