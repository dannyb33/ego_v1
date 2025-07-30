import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Billing, ProjectionType, TableV2 } from 'aws-cdk-lib/aws-dynamodb'


export class DatabaseStack extends Stack {
    public readonly table: TableV2;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        this.table = new TableV2(this, 'EgoTable', {
            tableName: 'ego_table',
            partitionKey: {
                name: 'PK',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'SK',
                type: AttributeType.STRING
            },
            billing: Billing.onDemand(),
            removalPolicy: RemovalPolicy.DESTROY,

            globalSecondaryIndexes: [
                {
                    indexName: 'GSI1',
                    partitionKey: {
                        name: 'GSI1PK',
                        type: AttributeType.STRING
                    },
                    sortKey: {
                        name: 'GSI1SK',
                        type: AttributeType.STRING
                    },
                    projectionType: ProjectionType.ALL
                }
            ]
        });
    }
}