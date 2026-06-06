import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { env } from '../env-validation';
import { logger } from '../logger';
import { createRedisClient } from '../cache';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.FRONTEND_URL, env.ADMIN_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

// Rate limiting configurations
const redis = createRedisClient();

// General API rate limiter
export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.RATE_LIMIT_MAX, // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: {
    incr: async (key: string) => {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000));
      }
      return {
        totalHits: current,
        resetTime: new Date(Date.now() + env.RATE_LIMIT_WINDOW_MS),
      };
    },
    decrement: async (key: string) => {
      await redis.decr(key);
    },
    resetKey: async (key: string) => {
      await redis.del(key);
    },
  },
});

// Auth rate limiter - stricter for login attempts
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Upload rate limiter
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    error: 'Upload limit exceeded, please wait before uploading more files.',
    retryAfter: 60,
  },
});

// GraphQL rate limiter based on operation complexity
export const graphqlRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const query = req.body?.query || '';

  // Calculate operation complexity (simplified)
  const depthLimit = 10;
  const complexity = calculateQueryComplexity(query);

  if (complexity > depthLimit) {
    return res.status(400).json({
      error: 'Query too complex',
      maxComplexity: depthLimit,
      actualComplexity: complexity,
    });
  }

  next();
};

// Simple query complexity calculator
function calculateQueryComplexity(query: string): number {
  if (!query) return 0;

  // Count nested levels and field selections
  const openBraces = (query.match(/\{/g) || []).length;
  const fields = (query.match(/\w+(?=\s*[\(\{])/g) || []).length;

  return Math.floor((openBraces + fields) / 2);
}

// IP whitelist middleware for admin endpoints
export const adminIPWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next(); // Skip if no IPs configured
    }

    const clientIP = req.ip || req.connection?.remoteAddress || 'unknown';

    if (!allowedIPs.includes(clientIP)) {
      logger.warn(`Admin access denied for IP: ${clientIP}`, {
        userAgent: req.headers['user-agent'],
        path: req.path,
      });

      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access admin endpoints',
      });
    }

    next();
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const size = res.get('Content-Length') || 0;

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      size: `${size}B`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400, // 24 hours
};

// Anti-CSRF middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GraphQL (which should use other protections)
  if (req.path === '/graphql') {
    return next();
  }

  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['authorization'] as string;

  if (!token || !sessionToken) {
    return res.status(403).json({
      error: 'CSRF token required',
      message: 'Missing CSRF token or session',
    });
  }

  // Simple CSRF validation (in production, use a proper CSRF library)
  if (!isValidCSRFToken(token, sessionToken)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
    });
  }

  next();
};

// Simple CSRF token validation
function isValidCSRFToken(token: string, sessionToken: string): boolean {
  // This is a simplified implementation
  // In production, use a proper CSRF token library
  const expectedToken = Buffer.from(sessionToken).toString('base64').substring(0, 16);
  return token === expectedToken;
}

// Request size limiter
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        maxSize: `${Math.floor(maxSize / 1024 / 1024)}MB`,
        actualSize: `${Math.floor(contentLength / 1024 / 1024)}MB`,
      });
    }

    next();
  };
};

// Security audit logging
export const securityAuditLog = (req: Request, res: Response, next: NextFunction) => {
  // Log sensitive operations
  const sensitivePatterns = [
    /\/auth\//,
    /\/admin\//,
    /password/i,
    /login/i,
    /register/i,
    /token/i,
  ];

  const isSensitive = sensitivePatterns.some(pattern =>
    pattern.test(req.path) || pattern.test(req.body?.operationName || '')
  );

  if (isSensitive) {
    logger.info('Security Audit Log', {
      type: 'SENSITIVE_OPERATION',
      method: req.method,
      path: req.path,
      operation: req.body?.operationName,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }

  next();
};