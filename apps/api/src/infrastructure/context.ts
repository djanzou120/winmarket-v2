import type { BaseContext } from '@apollo/server';
import { db, type Database } from 'database';
import { createRedisClient } from './cache';
import { logger } from './logger';
import { verifyToken } from '../modules/auth/utils/jwt';
import type { User } from 'database/types';

export interface GraphQLContext extends BaseContext {
  db: Database;
  cache: ReturnType<typeof createRedisClient>;
  user?: User;
  isAuthenticated: boolean;
  req: {
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

export async function createContext({ req }: { req: any }): Promise<GraphQLContext> {
  const cache = createRedisClient();

  // Extract auth token
  const authorization = req.headers.authorization || '';
  const token = authorization.replace('Bearer ', '');

  let user: User | undefined;
  let isAuthenticated = false;

  // Verify JWT token if present
  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        // Fetch user from database
        const users = await db.query.users.findFirst({
          where: (users, { eq, and }) =>
            and(
              eq(users.id, payload.userId),
              eq(users.status, 'ACTIVE')
            ),
          with: {
            profile: true,
            wallet: true,
          },
        });

        if (users) {
          user = users;
          isAuthenticated = true;
        }
      }
    } catch (error) {
      logger.warn('Invalid token provided:', { token: token.substring(0, 20) + '...' });
    }
  }

  return {
    db,
    cache,
    user,
    isAuthenticated,
    req: {
      headers: req.headers || {},
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    },
  };
}

// Helper functions for context
export function requireAuth(context: GraphQLContext): User {
  if (!context.isAuthenticated || !context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}

export function requireRole(context: GraphQLContext, roles: string[]): User {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
  }
  return user;
}

export function requireAdmin(context: GraphQLContext): User {
  return requireRole(context, ['ADMIN']);
}

export function requireSeller(context: GraphQLContext): User {
  return requireRole(context, ['SELLER', 'ADMIN']);
}