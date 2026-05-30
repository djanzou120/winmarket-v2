// Export all Drizzle database types and schemas
export * from './db/types';
export * from './db/schema';
export * from './db/connection';

// Legacy types for backward compatibility (these will be deprecated)
export interface UserPreferences {
  language: string;
  currency: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export enum AddressType {
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BOTH = 'BOTH'
}

export interface Chat {
  id: string;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  productId?: string;
  product?: Product;
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

// Re-export with correct imports
import { User, Product, ChatMessage } from './db/types';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

// GraphQL Types
export interface GraphQLContext {
  user?: User;
  req: any;
  res: any;
  redis: any;
  db: any;
}

// Configuration Types
export interface AppConfig {
  port: number;
  env: Environment;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  payment: PaymentConfig;
  aws: AWSConfig;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: string;
  refreshTokenExpiration: string;
  bcryptRounds: number;
}

export interface PaymentConfig {
  stripe: {
    publicKey: string;
    secretKey: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    sandbox: boolean;
  };
}

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}