import { generateClient } from 'aws-amplify/api';
import type { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient();

export const executeGraphQLQuery = async <T = any>(
    query: string,
    variables?: any
): Promise<T> => {
    try {
        const graphqlOptions: any = { query };

        if (variables && Object.keys(variables).length > 0) {
            graphqlOptions.variables = variables;
        }

        const result = await client.graphql(graphqlOptions) as GraphQLResult<T>;
        
        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
            console.error('GraphQL Mutation Errors Details:', result.errors);
            const errorMessages = result.errors.map(err => err.message).join(', ');
            throw new Error(`GraphQL Mutation Error: ${errorMessages}`);
        }

        return result.data as T;
    } catch (error) {
        console.error('GraphQL Mutation Error:', error);
        throw error;
    }
};

export const executeGraphQLMutation = async <T = any>(
    mutation: string,
    variables?: any
): Promise<T> => {
    try {
        const graphqlOptions: any = { query: mutation };

        if (variables && Object.keys(variables).length > 0) {
            graphqlOptions.variables = variables;
        }

        const result = await client.graphql(graphqlOptions) as GraphQLResult<T>;

        // Check for GraphQL errors
        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
        }

        return result.data as T;
    } catch (error) {
        console.error('GraphQL Mutation Error:', error);
        throw error;
    }
};