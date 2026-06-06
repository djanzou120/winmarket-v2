import { z } from "zod";
import { logger } from "./logger";

// Environment schema validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("4000"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.string().transform(Number).default("5432"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default("0"),

  // Authentication
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  // MinIO/S3
  MINIO_ENDPOINT: z.string().default("http://localhost:9000"),
  MINIO_ACCESS_KEY: z.string().min(1, "MINIO_ACCESS_KEY is required"),
  MINIO_SECRET_KEY: z.string().min(1, "MINIO_SECRET_KEY is required"),
  MINIO_BUCKET: z.string().default("winmarket-uploads"),
  MINIO_REGION: z.string().default("us-east-1"),
  MINIO_USE_SSL: z.string().transform(val => val === "true").default("false"),
  MINIO_PORT: z.string().transform(Number).optional(),

  // Security
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:3001"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),

  // GraphQL
  GRAPHQL_PLAYGROUND_ENABLED: z.string().transform(val => val === "true").default("true"),
  GRAPHQL_INTROSPECTION: z.string().transform(val => val === "true").default("true"),

  // Optional services (can be undefined in development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  EXPO_ACCESS_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_ENABLED: z.string().transform(val => val === "true").default("true"),
});

export type Environment = z.infer<typeof envSchema>;

// Validate and parse environment variables
export function validateEnvironment(): Environment {
  try {
    logger.info("🔍 Validating environment configuration...");

    // Check for required env file in development
    if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) {
      logger.error("❌ Missing environment variables. Please copy .env.example to .env and configure it.");
      process.exit(1);
    }

    const parsed = envSchema.parse(process.env);

    // Additional validations
    const warnings: string[] = [];

    // Check for insecure defaults in production
    if (parsed.NODE_ENV === "production") {
      if (parsed.JWT_SECRET.includes("your-super-secret") || parsed.JWT_SECRET.length < 32) {
        logger.error("❌ Insecure JWT_SECRET in production. Please use a strong, random secret.");
        process.exit(1);
      }

      if (parsed.BETTER_AUTH_SECRET.includes("your-super-secret") || parsed.BETTER_AUTH_SECRET.length < 32) {
        logger.error("❌ Insecure BETTER_AUTH_SECRET in production. Please use a strong, random secret.");
        process.exit(1);
      }

      if (parsed.MINIO_ACCESS_KEY === "minioadmin" || parsed.MINIO_SECRET_KEY === "minioadmin") {
        warnings.push("⚠️  Using default MinIO credentials in production");
      }

      if (!parsed.SENTRY_DSN) {
        warnings.push("⚠️  SENTRY_DSN not configured - error tracking disabled");
      }

      if (!parsed.SMTP_HOST) {
        warnings.push("⚠️  Email service not configured - notifications disabled");
      }
    }

    // Log warnings
    if (warnings.length > 0) {
      warnings.forEach(warning => logger.warn(warning));
    }

    // Log configuration summary
    logger.info("✅ Environment validation passed", {
      nodeEnv: parsed.NODE_ENV,
      port: parsed.PORT,
      dbHost: parsed.DB_HOST,
      redisHost: parsed.REDIS_HOST,
      minioEndpoint: parsed.MINIO_ENDPOINT,
      corsOrigin: parsed.CORS_ORIGIN,
    });

    return parsed;

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("❌ Environment validation failed:");
      error.errors.forEach(err => {
        logger.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      logger.error("❌ Unexpected error during environment validation:", error);
    }

    process.exit(1);
  }
}

// Export parsed environment for use throughout the application
export const env = validateEnvironment();