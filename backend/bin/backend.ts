#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { DatabaseStack } from '../lib/database-stack'
import { ApiStack } from '../lib/api-stack'
import { FrontendStack } from '../lib/frontend-stack';
import { S3Stack } from '../lib/s3-stack';

const app = new cdk.App()

const environment = app.node.tryGetContext('environment') || 'dev';
const githubOwner = app.node.tryGetContext('githubOwner') || 'dannyb33';
const githubRepo = app.node.tryGetContext('githubRepo') || 'ego_v1';

const env = {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION || 'us-east-2',
};

const authStack = new AuthStack(app, `EgoDatabaseStack`, {
  env: env
});

const databaseStack = new DatabaseStack(app, `EgoAuthStack`, {
  env: env
});

const s3Stack = new S3Stack(app, 'EgoS3Stack', {
  env: env
});

const apiStack = new ApiStack(app, `EgoApiStack`, {
  env: env,
  table: databaseStack.table,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  bucket: s3Stack.bucket,
  distribution: s3Stack.distribution,
});

// const frontendStack = new FrontendStack(app, `EgoFrontendStack`, {
//     env,
//     api: apiStack.api,
//     userPool: authStack.userPool,
//     userPoolClient: authStack.userPoolClient,
//     environment,
//     githubOwner,
//     githubRepo,
// });
