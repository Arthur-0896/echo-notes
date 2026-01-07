// src/integrations/aws/s3Upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface S3UploadParams {
  file: Blob;
  fileName: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export async function uploadToS3({ file, fileName, bucket, region, accessKeyId, secretAccessKey }: S3UploadParams): Promise<string> {
  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const arrayBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
  });

  await s3.send(command);

  return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
}
