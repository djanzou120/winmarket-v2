import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './infrastructure/context';
import { logger } from './infrastructure/logger';
import { env } from './infrastructure/env-validation';
import { initializeMonitoring, performHealthCheck } from './infrastructure/health';
import { runMigrations } from './infrastructure/database/migrations';
import { closeDatabaseConnection } from './infrastructure/database/connection';
import { cache } from './infrastructure/cache';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
  introspection: env.GRAPHQL_INTROSPECTION,
  plugins: [
    // Custom logging plugin
    {
      async requestDidStart() {
        return {
          async didResolveOperation(context: any) {
            logger.info('GraphQL Operation', {
              operationName: context.request.operationName,
              operation: context.request.query?.substring(0, 200),
            });
          },
          async didEncounterErrors(context: any) {
            logger.error('GraphQL Errors', {
              errors: context.errors.map((err: any) => ({
                message: err.message,
                path: err.path,
                locations: err.locations,
              })),
            });
          },
        };
      },
    },
  ],
});

// Initialize infrastructure and start server
async function startServer() {
  try {
    logger.info('🚀 Starting WinMarket V2 API...');

    // Initialize monitoring first
    const monitoringInitialized = await initializeMonitoring();
    if (!monitoringInitialized) {
      logger.error('❌ Failed to initialize monitoring');
      process.exit(1);
    }

    // Initial health check
    const healthReport = await performHealthCheck();

    // Run database migrations only if database is available
    if (env.NODE_ENV !== 'test') {
      const dbHealthy = healthReport.services.find(s => s.service === 'database')?.status === 'healthy';

      if (dbHealthy) {
        await runMigrations();
        logger.info('✅ Database migrations completed');
      } else {
        logger.warn('⚠️ Skipping migrations - database not available');
      }
    }
    if (healthReport.status === 'unhealthy') {
      logger.error('❌ Initial health check failed - aborting startup');
      process.exit(1);
    }

    if (healthReport.status === 'degraded') {
      logger.warn('⚠️ Some services are unhealthy, but continuing startup...');
    }

    // Start Apollo Server
    const { url } = await startStandaloneServer(server, {
      listen: { port: env.PORT },
      context: createContext,
    });

    logger.info(`✅ WinMarket V2 GraphQL API ready at ${url}`);
    if (env.GRAPHQL_PLAYGROUND_ENABLED) {
      logger.info(`📊 GraphQL Playground available at ${url}graphql`);
    }
    logger.info(`🔍 Health check endpoint: ${url}health`);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    await cleanup();
    process.exit(1);
  }
}

// Cleanup function
async function cleanup() {
  logger.info('🧹 Cleaning up resources...');

  try {
    await Promise.all([
      server.stop(),
      closeDatabaseConnection(),
      cache.disconnect(),
    ]);
    logger.info('✅ Cleanup completed');
  } catch (error) {
    logger.error('❌ Error during cleanup:', error);
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  logger.info('📡 Received SIGINT, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('📡 Received SIGTERM, shutting down gracefully...');
  await cleanup();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  cleanup().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', { promise, reason });
  cleanup().finally(() => process.exit(1));
});

// Start the server
startServer();