import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import from new DDD architecture
import { allTypeDefs, allResolvers } from './domains';
import { createContext } from './infrastructure/context';
import { logger } from './infrastructure/logger';
import { config } from './infrastructure/config';
import { AppInitializer } from './infrastructure/app-initializer';
import { closeDatabaseConnection } from './infrastructure/database/connection';

// Create executable schema from DDD architecture
const schema = makeExecutableSchema({
  typeDefs: allTypeDefs,
  resolvers: allResolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
  introspection: config.graphql.introspection,
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
  const appInitializer = new AppInitializer();

  try {
    logger.info('🚀 Starting WinMarket V2 API...');

    // Initialize all infrastructure services
    const initResult = await appInitializer.initialize();

    if (!initResult.success) {
      logger.error('❌ Application initialization failed:', initResult.errors);
      process.exit(1);
    }

    // Start Apollo Server
    const { url } = await startStandaloneServer(server, {
      listen: { port: config.server.port },
      context: createContext,
    });

    // Success logging
    logger.info(`✅ WinMarket V2 GraphQL API ready at ${url}`);
    if (config.graphql.playground) {
      logger.info(`📊 GraphQL Playground available at ${url}`);
    }
    logger.info(`🔍 Health check endpoint: http://localhost:${appInitializer.getHealthEndpointPort()}/health`);

    // Seed development data if needed
    await appInitializer.seedDevelopmentData();

    // Store initializer for cleanup
    (global as any).__appInitializer = appInitializer;

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
    const appInitializer = (global as any).__appInitializer;

    await Promise.all([
      server.stop(),
      appInitializer?.shutdown(),
      closeDatabaseConnection(),
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