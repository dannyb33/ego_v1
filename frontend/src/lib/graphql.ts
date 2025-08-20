import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient();

export const executeGraphQLQuery = async <TData>(
  options: Parameters<typeof client.graphql>[0]
): Promise<TData> => {
  try {
    const result = (await client.graphql(options)) as GraphQLResult<TData>;

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL query.');
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GraphQL Query Error:', error);
      throw error;
    }
    throw new Error('Unknown GraphQL Query Error');
  }
};

export const executeGraphQLMutation = async <TData>(
  options: Parameters<typeof client.graphql>[0]
): Promise<TData> => {
  try {
    const result = (await client.graphql(options)) as GraphQLResult<TData>;

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    if (!result.data) {
      throw new Error('No data returned from GraphQL mutation.');
    }

    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GraphQL Mutation Error:', error);
      throw error;
    }
    throw new Error('Unknown GraphQL Mutation Error');
  }
};