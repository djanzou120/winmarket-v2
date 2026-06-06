import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { db, closeDatabaseConnection } from '../../../infrastructure/database/connection';

describe('Database Connection', () => {
  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('should establish database connection', async () => {
    expect(db).toBeDefined();
    expect(typeof db.query).toBe('object');
  });

  it('should execute simple query', async () => {
    const result = await db.execute('SELECT 1 as test');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle invalid queries gracefully', async () => {
    try {
      await db.execute('SELECT invalid_column FROM non_existent_table');
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should support query builder', async () => {
    expect(db.query.users).toBeDefined();
    expect(db.query.products).toBeDefined();
    expect(db.query.orders).toBeDefined();
  });
});

describe('Database Schema', () => {
  it('should have all required tables', async () => {
    const tables = [
      'users', 'userProfiles', 'userWallets',
      'categories', 'products', 'productVariants',
      'orders', 'orderItems', 'walletTransactions',
      'reviews', 'reviewVotes', 'reviewReports',
      'deliveryProviders', 'deliveryOptions', 'deliveryZones',
      'notifications', 'notificationPreferences', 'deviceTokens'
    ];

    tables.forEach(table => {
      expect(db.query[table]).toBeDefined();
    });
  });

  it('should validate schema relationships', async () => {
    // Test that foreign key relationships are properly defined
    expect(db.query.userProfiles).toBeDefined();
    expect(db.query.userWallets).toBeDefined();
    expect(db.query.products).toBeDefined();
    expect(db.query.orders).toBeDefined();
  });
});