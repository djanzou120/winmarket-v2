import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/federation';
import { readFileSync } from 'fs';
import { join } from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext } from './infrastructure/context';
import { logger } from './infrastructure/logger';

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    // Custom logging plugin
    {
      requestDidStart() {
        return {
          didResolveOperation(context) {
            logger.info('GraphQL Operation', {
              operationName: context.request.operationName,
              operation: context.request.query?.substring(0, 200),
            });
          },
          didEncounterErrors(context) {
            logger.error('GraphQL Errors', {
              errors: context.errors.map(err => ({
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

// Start server
async function startServer() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.PORT) || 4000 },
      context: createContext,
    });

    logger.info(`🚀 WinMarket V2 GraphQL API ready at ${url}`);
    logger.info(`📊 GraphQL Playground available at ${url}graphql`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

// Start the server
startServer();