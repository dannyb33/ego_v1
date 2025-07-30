import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GraphqlApi, SchemaFile, MappingTemplate, Definition, AuthorizationType } from 'aws-cdk-lib/aws-appsync';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';

interface ApiStackProps extends StackProps {
    table: TableV2;  // Pass table from database stack
    userPool: UserPool;
    userPoolClient: UserPoolClient;
}

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)

        const userFunction = new NodejsFunction(this, 'UserFunction', {
            runtime: Runtime.NODEJS_18_X,
            entry: 'lambda/users/handler.ts',
            handler: 'handler',
            environment: {
                TABLE_NAME: props.table.tableName,
            },
        });

        props.table.grantReadWriteData(userFunction)

        const api = new GraphqlApi(this, 'EgoApi', {
            name: 'ego-api',
            definition: Definition.fromFile('graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: props.userPool
                    }
                }
            }
        })

        const userSource = api.addLambdaDataSource('UserLambdaDataSource', userFunction)

        userSource.createResolver('GetUserResolver', {
            typeName: 'Query',
            fieldName: 'getUser',
        });
    }
}