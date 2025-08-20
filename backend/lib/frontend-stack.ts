import { App, GitHubSourceCodeProvider, RedirectStatus } from "@aws-cdk/aws-amplify-alpha";
import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { GraphqlApi } from "aws-cdk-lib/aws-appsync";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface FrontendStackProps extends StackProps {
    api: GraphqlApi;
    userPool: UserPool;
    userPoolClient: UserPoolClient;
    environment: string;
    githubOwner: string;
    githubRepo: string;
}

export class FrontendStack extends Stack {
    public readonly amplifyApp: App;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        const amplifyRole = new Role(this, 'AmplifyRole', {
            assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
            ],
        });

        this.amplifyApp = new App(this, 'EgoFrontend', {
            appName: `ego-frontend-${props.environment}`,
            sourceCodeProvider: new GitHubSourceCodeProvider({
                owner: props.githubOwner,
                repository: props.githubRepo,
                oauthToken: SecretValue.secretsManager('github-token'),
            }),
            role: amplifyRole,
            buildSpec: BuildSpec.fromObjectToYaml({
                version: '1.0',
                applications: [{
                    appRoot: 'frontend',
                    frontend: {
                        phases: {
                            preBuild: {
                                commands: [
                                    'npm ci'
                                ]
                            },
                            build: {
                                commands: [
                                    'npm run build'
                                ]
                            }
                        },
                        artifacts: {
                            baseDirectory: '.next',
                            files: ['**/*']
                        },
                        cache: {
                            paths: ['node_modules/**/*']
                        }
                    }
                }]
            }),
            environmentVariables: {
                AMPLIFY_MONOREPO_APP_ROOT: 'frontend',
                REACT_APP_AWS_REGION: this.region,
                REACT_APP_APPSYNC_URL: props.api.graphqlUrl,
                REACT_APP_USER_POOL_ID: props.userPool.userPoolId,
                REACT_APP_USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
                REACT_APP_ENVIRONMENT: props.environment,
            },
            customRules: [{
                source: '/<*>',
                target: '/index.html',
                status: RedirectStatus.NOT_FOUND_REWRITE
            }]
        });

        const branchName = props.environment === 'prod' ? 'main' : 'develop';
        this.amplifyApp.addBranch(branchName, {
            branchName,
            autoBuild: true
        });
    }
}