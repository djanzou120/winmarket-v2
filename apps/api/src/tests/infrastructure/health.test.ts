import { describe, it, expect } from 'bun:test';
import { performHealthCheck, initializeMonitoring } from '../../infrastructure/health';

describe('Health Check System', () => {
  it('should perform basic health check', async () => {
    const health = await performHealthCheck();

    expect(health).toBeDefined();
    expect(health.status).toMatch(/healthy|degraded|unhealthy/);
    expect(health.timestamp).toBeDefined();
    expect(health.uptime).toBeGreaterThan(0);
    expect(Array.isArray(health.services)).toBe(true);
  });

  it('should check database connectivity', async () => {
    const health = await performHealthCheck();
    const dbService = health.services.find(s => s.service === 'database');

    expect(dbService).toBeDefined();
    expect(dbService?.status).toMatch(/healthy|unhealthy/);
    expect(dbService?.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should check Redis connectivity', async () => {
    const health = await performHealthCheck();
    const redisService = health.services.find(s => s.service === 'redis');

    expect(redisService).toBeDefined();
    expect(redisService?.status).toMatch(/healthy|unhealthy/);
  });

  it('should initialize monitoring', async () => {
    const result = await initializeMonitoring();

    expect(typeof result).toBe('boolean');
  });

  it('should include system metrics', async () => {
    const health = await performHealthCheck();

    expect(health.memory).toBeDefined();
    expect(health.memory.used).toBeGreaterThan(0);
    expect(health.memory.total).toBeGreaterThan(0);
    expect(health.memory.percentage).toBeGreaterThan(0);
    expect(health.memory.percentage).toBeLessThanOrEqual(100);
  });

  it('should handle service failures gracefully', async () => {
    // Health check should not throw even if some services fail
    expect(async () => {
      await performHealthCheck();
    }).not.toThrow();
  });
});