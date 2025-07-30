import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends Stack {
    public readonly userPool: UserPool;
    public readonly userPoolClient: UserPoolClient;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // User pool creation
        this.userPool = new UserPool(this, 'EgoUserPool', {
            userPoolName: 'ego_users',
            selfSignUpEnabled: true,
            signInCaseSensitive: false,
            signInAliases: {
                username: true,
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },            
            },
            autoVerify: {
                email: true,
            },
        });

        // Create user pool client
        this.userPoolClient = new UserPoolClient(this, 'EgoUserPoolClient', {
            userPool: this.userPool,
            generateSecret: false,
        });
    }
}
