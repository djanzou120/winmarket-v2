// Configuration centralisée pour tous les environnements
import { env } from './env-validation';
import { logger } from './logger';

export interface AppConfig {
  server: {
    port: number;
    healthPort: number;
    corsOrigins: string[];
    bodyLimit: string;
    timeout: number;
  };
  graphql: {
    introspection: boolean;
    playground: boolean;
    debug: boolean;
    tracing: boolean;
  };
  database: {
    url: string;
    poolSize: number;
    connectionTimeout: number;
    maxRetries: number;
  };
  redis: {
    host: string;
    port: number;
    db: number;
    maxRetries: number;
    retryDelay: number;
    keyPrefix: string;
  };
  minio: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
    region: string;
    buckets: {
      public: string;
      private: string;
      temp: string;
    };
  };
  auth: {
    jwtSecret: string;
    jwtExpiry: string;
    refreshExpiry: string;
    bcryptRounds: number;
  };
  security: {
    rateLimit: {
      windowMs: number;
      max: number;
    };
    cors: {
      credentials: boolean;
      maxAge: number;
    };
  };
  logging: {
    level: string;
    format: 'json' | 'simple';
    requests: boolean;
    errors: boolean;
  };
  monitoring: {
    healthCheck: {
      interval: number;
      timeout: number;
    };
    metrics: {
      enabled: boolean;
      prefix: string;
    };
  };
}

// Configuration par environnement
const configurations: Record<string, Partial<AppConfig>> = {
  development: {
    server: {
      timeout: 30000,
      bodyLimit: '10mb',
    },
    graphql: {
      introspection: true,
      playground: true,
      debug: true,
      tracing: true,
    },
    logging: {
      level: 'debug',
      format: 'simple',
      requests: true,
      errors: true,
    },
    monitoring: {
      healthCheck: {
        interval: 30000,
        timeout: 5000,
      },
    },
  },

  test: {
    server: {
      timeout: 5000,
      bodyLimit: '1mb',
    },
    graphql: {
      introspection: false,
      playground: false,
      debug: false,
      tracing: false,
    },
    logging: {
      level: 'error',
      format: 'json',
      requests: false,
      errors: true,
    },
    database: {
      poolSize: 5,
    },
    redis: {
      db: 1, // Use different DB for tests
    },
  },

  staging: {
    server: {
      timeout: 30000,
      bodyLimit: '5mb',
    },
    graphql: {
      introspection: true,
      playground: true,
      debug: false,
      tracing: false,
    },
    logging: {
      level: 'info',
      format: 'json',
      requests: true,
      errors: true,
    },
    database: {
      poolSize: 10,
      connectionTimeout: 10000,
    },
  },

  production: {
    server: {
      timeout: 30000,
      bodyLimit: '5mb',
    },
    graphql: {
      introspection: false,
      playground: false,
      debug: false,
      tracing: false,
    },
    logging: {
      level: 'warn',
      format: 'json',
      requests: false,
      errors: true,
    },
    database: {
      poolSize: 20,
      connectionTimeout: 10000,
      maxRetries: 5,
    },
    redis: {
      maxRetries: 5,
      retryDelay: 1000,
    },
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // requests per window
      },
    },
    monitoring: {
      healthCheck: {
        interval: 10000,
        timeout: 3000,
      },
      metrics: {
        enabled: true,
      },
    },
  },
};

// Configuration de base
const baseConfig: AppConfig = {
  server: {
    port: env.PORT,
    healthPort: env.PORT + 1,
    corsOrigins: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
    bodyLimit: '5mb',
    timeout: 30000,
  },
  graphql: {
    introspection: env.GRAPHQL_INTROSPECTION,
    playground: env.GRAPHQL_PLAYGROUND_ENABLED,
    debug: env.NODE_ENV === 'development',
    tracing: env.NODE_ENV === 'development',
  },
  database: {
    url: env.DATABASE_URL,
    poolSize: 10,
    connectionTimeout: 10000,
    maxRetries: 3,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: 0,
    maxRetries: 3,
    retryDelay: 500,
    keyPrefix: env.REDIS_KEY_PREFIX,
  },
  minio: {
    endpoint: env.MINIO_ENDPOINT,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    useSSL: env.MINIO_USE_SSL,
    region: env.MINIO_REGION,
    buckets: {
      public: env.MINIO_BUCKET_PUBLIC,
      private: env.MINIO_BUCKET_PRIVATE,
      temp: env.MINIO_BUCKET_TEMP,
    },
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiry: env.JWT_EXPIRES_IN,
    refreshExpiry: env.JWT_REFRESH_EXPIRES_IN,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // requests per window
    },
    cors: {
      credentials: true,
      maxAge: 86400, // 24 hours
    },
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? 'json' : 'simple',
    requests: env.NODE_ENV !== 'production',
    errors: true,
  },
  monitoring: {
    healthCheck: {
      interval: 30000,
      timeout: 5000,
    },
    metrics: {
      enabled: env.NODE_ENV === 'production',
      prefix: 'winmarket_api_',
    },
  },
};

// Merge configuration
function createConfig(): AppConfig {
  const environment = env.NODE_ENV;
  const envConfig = configurations[environment] || {};

  const config = {
    ...baseConfig,
    ...Object.keys(envConfig).reduce((acc, key) => {
      const k = key as keyof AppConfig;
      acc[k] = { ...baseConfig[k], ...envConfig[k] } as any;
      return acc;
    }, {} as Partial<AppConfig>)
  } as AppConfig;

  logger.info('🔧 Configuration loaded', {
    environment,
    server: { port: config.server.port, healthPort: config.server.healthPort },
    graphql: { introspection: config.graphql.introspection, playground: config.graphql.playground },
    logging: { level: config.logging.level, format: config.logging.format },
  });

  return config;
}

export const config = createConfig();