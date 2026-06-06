import { beforeAll, afterAll } from 'bun:test';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';

  // Override required environment variables for testing
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/winmarket_test';
  process.env.JWT_SECRET = 'test_jwt_secret_that_is_long_enough_for_testing_purposes_123456';
  process.env.BETTER_AUTH_SECRET = 'test_better_auth_secret_that_is_long_enough_for_testing_123456';
  process.env.MINIO_ACCESS_KEY = 'test-access-key';
  process.env.MINIO_SECRET_KEY = 'test-secret-key';
  process.env.DB_USER = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'winmarket_test';

  // Optional test configurations
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
  process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:3001';

  console.log('🧪 Test environment initialized');
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Test cleanup completed');
});

// Export test utilities
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    userType: 'BUYER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockProduct(overrides = {}) {
  return {
    id: 'test-product-id',
    sellerId: 'test-seller-id',
    categoryId: 'test-category-id',
    title: 'Test Product',
    description: 'A test product',
    price: '99.99',
    status: 'ACTIVE',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockOrder(overrides = {}) {
  return {
    id: 'test-order-id',
    buyerId: 'test-buyer-id',
    totalAmount: '99.99',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockGraphQLContext(user = null, overrides = {}) {
  return {
    user,
    isAuthenticated: !!user,
    session: user ? { token: 'mock-session-token' } : null,
    permissions: user?.userType === 'ADMIN' ? ['admin'] : [],
    db: {
      query: {},
      insert: async () => [{}],
      update: async () => [{}],
      delete: async () => [{}],
      execute: async () => [],
    },
    cache: {
      get: async () => null,
      set: async () => 'OK',
      del: async () => 1,
    },
    schema: {},
    req: {
      headers: {},
      ip: '127.0.0.1',
      userAgent: 'test-user-agent',
    },
    ...overrides,
  };
}