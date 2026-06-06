import type { BaseContext } from '@apollo/server';
import { db, type Database } from './database/connection';
import { createRedisClient } from './cache';

export interface GraphQLContext extends BaseContext {
  db: Database;
  cache: ReturnType<typeof createRedisClient>;
  user?: any; // Will be typed properly once auth is implemented
  isAuthenticated: boolean;
  req: {
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

export async function createContext({ req }: { req: any }): Promise<GraphQLContext> {
  const cache = createRedisClient();

  // Extract auth token (for future implementation)
  // const authorization = req.headers.authorization || '';
  // const token = authorization.replace('Bearer ', '');

  let user: any = undefined;
  let isAuthenticated = false;

  // TODO: Implement JWT token verification once auth module is ready
  // if (token) {
  //   try {
  //     const payload = await verifyToken(token);
  //     if (payload && payload.userId) {
  //       // Fetch user from database
  //       const users = await db.query.users.findFirst({
  //         where: (users, { eq, and }) =>
  //           and(
  //             eq(users.id, payload.userId),
  //             eq(users.status, 'ACTIVE')
  //           ),
  //       });

  //       if (users) {
  //         user = users;
  //         isAuthenticated = true;
  //       }
  //     }
  //   } catch (error) {
  //     logger.warn('Invalid token provided:', { token: token.substring(0, 20) + '...' });
  //   }
  // }

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
export function requireAuth(context: GraphQLContext): any {
  if (!context.isAuthenticated || !context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}

export function requireRole(context: GraphQLContext, roles: string[]): any {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
  }
  return user;
}

export function requireAdmin(context: GraphQLContext): any {
  return requireRole(context, ['ADMIN']);
}

export function requireSeller(context: GraphQLContext): any {
  return requireRole(context, ['SELLER', 'ADMIN']);
}