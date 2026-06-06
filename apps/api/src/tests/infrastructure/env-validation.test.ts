import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { validateEnvironment } from '../../infrastructure/env-validation';

describe('Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate required environment variables', () => {
    // Set minimal required environment
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = 'this_is_a_very_long_secret_key_for_testing_purposes_123';
    process.env.BETTER_AUTH_SECRET = 'another_very_long_secret_key_for_auth_testing_123';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'test';

    const env = validateEnvironment();

    expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/test');
    expect(env.JWT_SECRET).toBe('this_is_a_very_long_secret_key_for_testing_purposes_123');
    expect(env.BETTER_AUTH_SECRET).toBe('another_very_long_secret_key_for_auth_testing_123');
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
  });

  it('should use default values for optional variables', () => {
    // Set required vars
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = 'this_is_a_very_long_secret_key_for_testing_purposes_123';
    process.env.BETTER_AUTH_SECRET = 'another_very_long_secret_key_for_auth_testing_123';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'test';

    const env = validateEnvironment();

    expect(env.REDIS_HOST).toBe('localhost');
    expect(env.REDIS_PORT).toBe(6379);
    expect(env.CORS_ORIGIN).toBe('http://localhost:3000,http://localhost:3001');
    expect(env.FRONTEND_URL).toBe('http://localhost:3000');
    expect(env.ADMIN_URL).toBe('http://localhost:3001');
  });

  it('should throw error for missing required variables', () => {
    // Clear required environment variables
    delete process.env.DATABASE_URL;

    expect(() => {
      validateEnvironment();
    }).toThrow();
  });

  it('should validate JWT secret length', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = 'short'; // Too short
    process.env.BETTER_AUTH_SECRET = 'another_very_long_secret_key_for_auth_testing_123';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'test';

    expect(() => {
      validateEnvironment();
    }).toThrow('JWT_SECRET must be at least 32 characters');
  });

  it('should transform string numbers to numbers', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
    process.env.JWT_SECRET = 'this_is_a_very_long_secret_key_for_testing_purposes_123';
    process.env.BETTER_AUTH_SECRET = 'another_very_long_secret_key_for_auth_testing_123';
    process.env.MINIO_ACCESS_KEY = 'minioadmin';
    process.env.MINIO_SECRET_KEY = 'minioadmin';
    process.env.DB_USER = 'user';
    process.env.DB_PASSWORD = 'pass';
    process.env.DB_NAME = 'test';
    process.env.PORT = '8080';
    process.env.REDIS_PORT = '6380';

    const env = validateEnvironment();

    expect(typeof env.PORT).toBe('number');
    expect(env.PORT).toBe(8080);
    expect(typeof env.REDIS_PORT).toBe('number');
    expect(env.REDIS_PORT).toBe(6380);
  });
});