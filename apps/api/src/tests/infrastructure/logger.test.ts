import { describe, it, expect } from 'bun:test';
import { logger } from '../../infrastructure/logger';

describe('Logger', () => {
  it('should be defined and have required methods', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log info messages', () => {
    // Test that logger methods can be called without errors
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('should log error messages', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('should log warn messages', () => {
    expect(() => {
      logger.warn('Test warning message');
    }).not.toThrow();
  });

  it('should log debug messages', () => {
    expect(() => {
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  it('should handle structured logging', () => {
    expect(() => {
      logger.info('Structured log test', {
        userId: '123',
        action: 'login',
        ip: '127.0.0.1',
      });
    }).not.toThrow();
  });

  it('should handle error objects', () => {
    const error = new Error('Test error');
    expect(() => {
      logger.error('Error with object', { error: error.message, stack: error.stack });
    }).not.toThrow();
  });
});