import { Client } from "minio";
import { logger } from "./logger";

// MinIO configuration
function parseMinioEndpoint() {
  const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
  const url = new URL(endpoint);
  return {
    endPoint: url.hostname,
    port: parseInt(url.port || (url.protocol === 'https:' ? '443' : '80')),
    useSSL: url.protocol === 'https:',
  };
}

const endpointConfig = parseMinioEndpoint();
const minioConfig = {
  ...endpointConfig,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  region: process.env.MINIO_REGION || 'us-east-1',
};

const bucketName = process.env.MINIO_BUCKET || 'winmarket-uploads';

// Create MinIO client
export function createMinioClient() {
  return new Client(minioConfig);
}

// Storage service class
export class StorageService {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = createMinioClient();
    this.bucket = bucketName;
  }

  // Initialize bucket if it doesn't exist
  async initializeBucket(): Promise<boolean> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, minioConfig.region);
        logger.info(`✅ Created MinIO bucket: ${this.bucket}`);

        // Set public read policy for uploads
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/public/*`]
            }
          ]
        };

        await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
        logger.info(`✅ Set public read policy for bucket: ${this.bucket}`);
      }

      logger.info(`✅ MinIO bucket ready: ${this.bucket}`);
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize MinIO bucket:', error);
      return false;
    }
  }

  // Upload file
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
    isPublic: boolean = false
  ): Promise<string | null> {
    try {
      const objectName = isPublic ? `public/${fileName}` : `private/${fileName}`;

      await this.client.putObject(this.bucket, objectName, fileBuffer, fileBuffer.length, {
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000' // 1 year cache
      });

      const fileUrl = await this.getFileUrl(objectName, !isPublic);
      logger.info(`✅ File uploaded: ${objectName}`);
      return fileUrl;
    } catch (error) {
      logger.error('❌ File upload failed:', { fileName, error });
      return null;
    }
  }

  // Get file URL
  async getFileUrl(fileName: string, isPrivate: boolean = false): Promise<string> {
    try {
      if (isPrivate) {
        // Generate presigned URL for private files (expires in 1 hour)
        return await this.client.presignedGetObject(this.bucket, fileName, 3600);
      } else {
        // Return public URL for public files
        const protocol = minioConfig.useSSL ? 'https' : 'http';
        const port = minioConfig.port === 443 || minioConfig.port === 80 ? '' : `:${minioConfig.port}`;
        return `${protocol}://${minioConfig.endPoint}${port}/${this.bucket}/${fileName}`;
      }
    } catch (error) {
      logger.error('❌ Failed to get file URL:', { fileName, error });
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucket, fileName);
      logger.info(`✅ File deleted: ${fileName}`);
      return true;
    } catch (error) {
      logger.error('❌ File deletion failed:', { fileName, error });
      return false;
    }
  }

  // List files in directory
  async listFiles(prefix: string = '', maxKeys: number = 100): Promise<string[]> {
    try {
      const objects: string[] = [];
      const stream = this.client.listObjects(this.bucket, prefix, false);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (objects.length < maxKeys) {
            objects.push(obj.name!);
          }
        });

        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('❌ Failed to list files:', { prefix, error });
      return [];
    }
  }

  // Check if file exists
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file metadata
  async getFileMetadata(fileName: string) {
    try {
      return await this.client.statObject(this.bucket, fileName);
    } catch (error) {
      logger.error('❌ Failed to get file metadata:', { fileName, error });
      return null;
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      await this.client.listBuckets();
      return true;
    } catch (error) {
      logger.error('❌ MinIO ping failed:', error);
      return false;
    }
  }

  // Generate upload presigned URL for client-side uploads
  async generateUploadUrl(fileName: string, contentType: string, isPublic: boolean = false): Promise<string> {
    try {
      const objectName = isPublic ? `public/${fileName}` : `private/${fileName}`;

      return await this.client.presignedPutObject(
        this.bucket,
        objectName,
        3600 // 1 hour expiry
      );
    } catch (error) {
      logger.error('❌ Failed to generate upload URL:', { fileName, error });
      throw error;
    }
  }
}

// Default storage instance
export const storage = new StorageService();

// File upload utility types
export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  isPublic: boolean;
}

export const UPLOAD_CONFIGS = {
  PROFILE_AVATAR: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    isPublic: true
  },
  PRODUCT_IMAGE: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    isPublic: true
  },
  DOCUMENT: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    isPublic: false
  }
} as const;