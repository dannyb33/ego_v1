#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { DatabaseStack } from '../lib/database-stack'
import { ApiStack } from '../lib/api-stack'

const app = new cdk.App()

const authStack = new AuthStack(app, 'EgoAuthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

const databaseStack = new DatabaseStack(app, 'EgoDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

const apiStack = new ApiStack(app, 'EgoApiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION   
  },
  table: databaseStack.table,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
});

