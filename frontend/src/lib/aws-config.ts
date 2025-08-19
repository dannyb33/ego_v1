import { ResourcesConfig } from 'aws-amplify';

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT!,
      region: process.env.NEXT_PUBLIC_AWS_REGION!,
      defaultAuthMode: 'userPool',
    },
  },
//   Storage: {
//     S3: {
//       region: process.env.NEXT_PUBLIC_AWS_REGION!,
//       bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
//     },
//   },
};