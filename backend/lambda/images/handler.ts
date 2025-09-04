import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ensureUserProfile } from "../utils/ensureUserProfile";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../clients/s3";

const TABLE_NAME = process.env.TABLE_NAME!;

const BUCKET_NAME = process.env.BUCKET_NAME!;
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN!;

export const handler = async (event: any) => {
    const fieldName = event.info.fieldName;
    const sub = event.identity?.sub;
    if(!sub) {
        throw new Error("Unauthorized");
    }

    const user = await ensureUserProfile(event.identity);

    switch(fieldName) {
        case "getUploadUrl":
            return await getUploadUrl(sub, event.arguments.fileName, event.arguments.contentType);
        default:
            return;
    }
    
}

const getUploadUrl = async(sub: any, fileName: string, contentType: string) => {
    try {
        const key = `uploads/${sub}/${Date.now()}-${fileName}`;

        const putCmd = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const signedUrl = await getSignedUrl(s3, putCmd);
        const publicUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;

        return {uploadUrl: signedUrl, imageUrl: publicUrl};

    } catch (error) {
        throw new Error(`Unable to fetch upload url: ${error}`);
    }
}
