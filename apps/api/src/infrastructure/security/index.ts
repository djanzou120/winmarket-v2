import { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  securityHeaders,
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
  graphqlRateLimit,
  adminIPWhitelist,
  requestLogger,
  corsOptions,
  csrfProtection,
  requestSizeLimit,
  securityAuditLog,
} from './middleware';
import { env } from '../env-validation';
import { logger } from '../logger';

// Security configuration interface
export interface SecurityConfig {
  enableRequestLogging: boolean;
  enableRateLimit: boolean;
  enableCSRF: boolean;
  adminAllowedIPs: string[];
  maxRequestSize: number;
  enableSecurityHeaders: boolean;
  enableAuditLogging: boolean;
}

// Default security configuration
const defaultSecurityConfig: SecurityConfig = {
  enableRequestLogging: true,
  enableRateLimit: true,
  enableCSRF: env.NODE_ENV === 'production',
  adminAllowedIPs: [], // Empty means allow all in development
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  enableSecurityHeaders: true,
  enableAuditLogging: true,
};

// Apply all security middleware to Express app
export function applySecurity(app: Application, config: Partial<SecurityConfig> = {}) {
  const finalConfig = { ...defaultSecurityConfig, ...config };

  logger.info('🔒 Applying security middleware...', {
    config: {
      requestLogging: finalConfig.enableRequestLogging,
      rateLimit: finalConfig.enableRateLimit,
      csrf: finalConfig.enableCSRF,
      maxRequestSize: `${Math.floor(finalConfig.maxRequestSize / 1024 / 1024)}MB`,
      securityHeaders: finalConfig.enableSecurityHeaders,
      auditLogging: finalConfig.enableAuditLogging,
    }
  });

  // Security headers (must be first)
  if (finalConfig.enableSecurityHeaders) {
    app.use(securityHeaders);
  }

  // CORS configuration
  app.use(cors(corsOptions));

  // Request size limiting
  app.use(requestSizeLimit(finalConfig.maxRequestSize));

  // Request logging
  if (finalConfig.enableRequestLogging) {
    app.use(requestLogger);
  }

  // Security audit logging
  if (finalConfig.enableAuditLogging) {
    app.use(securityAuditLog);
  }

  // Rate limiting
  if (finalConfig.enableRateLimit) {
    // General API rate limiting
    app.use('/api', apiRateLimit);
    app.use('/graphql', apiRateLimit);

    // Stricter rate limiting for auth endpoints
    app.use('/api/auth', authRateLimit);
    app.use('/api/auth/*', authRateLimit);

    // Upload rate limiting
    app.use('/api/upload', uploadRateLimit);
    app.use('/api/files', uploadRateLimit);

    // GraphQL query complexity limiting
    app.use('/graphql', graphqlRateLimit);
  }

  // CSRF protection
  if (finalConfig.enableCSRF) {
    app.use(csrfProtection);
  }

  // Admin IP whitelist
  if (finalConfig.adminAllowedIPs.length > 0) {
    app.use('/api/admin', adminIPWhitelist(finalConfig.adminAllowedIPs));
    app.use('/admin', adminIPWhitelist(finalConfig.adminAllowedIPs));
  }

  // Error handling for security middleware
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error.message.includes('CORS')) {
      logger.warn('CORS violation', {
        origin: req.headers.origin,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        error: 'CORS policy violation',
        message: 'This origin is not allowed to access this resource',
      });
    }

    if (error.message.includes('rate limit')) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers['user-agent'],
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
      });
    }

    // Log other security-related errors
    logger.error('Security middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path,
    });

    next(error);
  });

  logger.info('✅ Security middleware applied successfully');
}

// Specific security middleware for different route groups
export const authSecurity = [
  authRateLimit,
  requestSizeLimit(1024 * 1024), // 1MB for auth requests
  securityAuditLog,
];

export const adminSecurity = [
  apiRateLimit,
  adminIPWhitelist([]), // Configure with actual IPs in production
  securityAuditLog,
];

export const uploadSecurity = [
  uploadRateLimit,
  requestSizeLimit(50 * 1024 * 1024), // 50MB for file uploads
];

export const graphqlSecurity = [
  graphqlRateLimit,
  requestSizeLimit(5 * 1024 * 1024), // 5MB for GraphQL requests
];

// Security health check
export function securityHealthCheck(): { status: 'healthy' | 'warning', issues: string[] } {
  const issues: string[] = [];

  // Check environment security
  if (env.NODE_ENV === 'production') {
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
      issues.push('JWT_SECRET is weak or missing');
    }

    if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
      issues.push('BETTER_AUTH_SECRET is weak or missing');
    }

    if (env.CORS_ORIGIN.includes('localhost')) {
      issues.push('CORS allows localhost in production');
    }

    if (env.GRAPHQL_PLAYGROUND_ENABLED) {
      issues.push('GraphQL Playground is enabled in production');
    }

    if (env.GRAPHQL_INTROSPECTION) {
      issues.push('GraphQL introspection is enabled in production');
    }
  }

  // Check rate limit configuration
  if (env.RATE_LIMIT_MAX > 1000) {
    issues.push('Rate limit is very high - potential DoS vulnerability');
  }

  const status = issues.length === 0 ? 'healthy' : 'warning';

  return { status, issues };
}

// Export middleware components
export {
  securityHeaders,
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
  graphqlRateLimit,
  adminIPWhitelist,
  requestLogger,
  corsOptions,
  csrfProtection,
  requestSizeLimit,
  securityAuditLog,
};

// Export types
export type { SecurityConfig };