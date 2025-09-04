import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GraphqlApi, SchemaFile, MappingTemplate, Definition, AuthorizationType } from 'aws-cdk-lib/aws-appsync';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';

interface ApiStackProps extends StackProps {
    table: TableV2;  // Pass table from database stack
    userPool: UserPool;
    userPoolClient: UserPoolClient;
    bucket: Bucket;
    distribution: Distribution;
}

export class ApiStack extends Stack {
    public readonly api: GraphqlApi;

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

        const postFunction = new NodejsFunction(this, 'PostFunction', {
            runtime: Runtime.NODEJS_18_X,
            entry: 'lambda/posts/handler.ts',
            handler: 'handler',
            environment: {
                TABLE_NAME: props.table.tableName,
            },
        });

        const imageFunction = new NodejsFunction(this, 'ImageFunction', {
            runtime: Runtime.NODEJS_18_X,
            entry: 'lambda/images/handler.ts',
            handler: 'handler',
            environment: {
                TABLE_NAME: props.table.tableName,
                BUCKET_NAME: props.bucket.bucketName,
                CLOUDFRONT_DOMAIN: props.distribution.domainName,
            }
        })

        props.table.grantReadWriteData(userFunction);
        props.table.grantReadWriteData(postFunction);

        props.table.grantReadWriteData(imageFunction);
        props.bucket.grantReadWrite(imageFunction);

         this.api = new GraphqlApi(this, 'EgoApi', {
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

        const userSource = this.api.addLambdaDataSource('UserLambdaDataSource', userFunction);
        const postSource = this.api.addLambdaDataSource('PostLambdaDataSource', postFunction);
        const imageSource = this.api.addLambdaDataSource('ImageLambdaDataSource', imageFunction);

        userSource.createResolver('GetCurrentUserResolver', {
            typeName: 'Query',
            fieldName: 'getCurrentUser',
        });

        userSource.createResolver('GetUserResolver', {
            typeName: 'Query',
            fieldName: 'getUser',
        });

        userSource.createResolver('SearchUsersResolver', {
            typeName: 'Query',
            fieldName: 'searchUsers',
        });

        userSource.createResolver('GetCurrentPageResolver', {
            typeName: 'Query',
            fieldName: 'getCurrentPage'
        });

        userSource.createResolver('GetPageResolver', {
            typeName: 'Query',
            fieldName: 'getPage'
        });

        userSource.createResolver("AddComponentResolver", {
            typeName: 'Mutation',
            fieldName: 'addPageComponent'
        });

        userSource.createResolver("RemoveComponentResolver", {
            typeName: 'Mutation',
            fieldName: 'removePageComponent'
        });

        userSource.createResolver("MoveComponentResolver", {
            typeName: 'Mutation',
            fieldName: 'movePageComponent'
        });

        userSource.createResolver("EditComponentResolver", {
            typeName: 'Mutation',
            fieldName: 'editPageComponent'
        });

        userSource.createResolver("GetUsersFollowedResolver", {
            typeName: 'Query',
            fieldName: 'getUsersFollowed'
        });

        userSource.createResolver("FollowUserResolver", {
            typeName: 'Mutation',
            fieldName: 'followUser'
        });

        userSource.createResolver("UnfollowUserResolver", {
            typeName: 'Mutation',
            fieldName: 'unfollowUser'
        });

        postSource.createResolver('GetCurrentPostsResolver', {
            typeName: 'Query',
            fieldName: 'getCurrentPosts'
        });

        postSource.createResolver('GetUserPostsResolver', {
            typeName: 'Query',
            fieldName: 'getUserPosts'
        });

        postSource.createResolver('CreateTextPostResolver', {
            typeName: 'Mutation',
            fieldName: 'createTextPost'
        });

        postSource.createResolver('CreateImagePostResolver', {
            typeName: 'Mutation',
            fieldName: 'createImagePost'
        });

        imageSource.createResolver('GetUploadUrlResolver', {
            typeName: 'Query',
            fieldName: 'getUploadUrl'
        })
    }
}