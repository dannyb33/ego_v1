import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const baseClient = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(baseClient);