import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Distribution, OriginSelectionCriteria, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront"
import { S3BucketOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

export class S3Stack extends Stack {
    public readonly bucket: Bucket;
    public readonly distribution: Distribution;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.bucket = new Bucket(this, 'EgoImageBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        });

        this.distribution = new Distribution(this, 'EgoImageDistribution', {
            defaultBehavior: {
                origin: S3BucketOrigin.withBucketDefaults(this.bucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            }
        })

        new CfnOutput(this, 'CloudFrontURL', {
            value: this.distribution.domainName,
        });
    }
}