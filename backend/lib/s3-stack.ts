import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

export class S3Stack extends Stack {
    public readonly bucket: Bucket;
    public readonly distribution: Distribution;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.bucket = new Bucket(this, 'EgoImageBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            cors: [
                {
                    allowedOrigins: [
                        "http://localhost:3000",          // local dev
                        "https://develop.d35njc4j7onvnr.amplifyapp.com",
                        "https://ego-journal.com"
                    ],
                    allowedMethods: [HttpMethods.PUT, HttpMethods.GET],
                    allowedHeaders: ["*"],
                },
            ],
        });

        this.distribution = new Distribution(this, 'EgoImageDistribution', {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            }
        })

        new CfnOutput(this, 'CloudFrontURL', {
            value: this.distribution.domainName,
        });
    }
}