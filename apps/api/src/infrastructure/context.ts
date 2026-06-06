import type { BaseContext } from '@apollo/server';
import { db, type Database } from './database/connection';
import { createRedisClient } from './cache';
import { createAuthContext } from './auth/routes';
import { schema } from './database/schema';

export interface GraphQLContext extends BaseContext {
  db: Database;
  cache: ReturnType<typeof createRedisClient>;
  schema: typeof schema;
  user?: any; // Will be typed properly once auth is implemented
  session?: any;
  isAuthenticated: boolean;
  permissions: string[];
  req: {
    headers: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

export async function createContext({ req }: { req: any }): Promise<GraphQLContext> {
  const cache = createRedisClient();

  // Use Better Auth context
  const authContext = await createAuthContext(req);

  return {
    db,
    cache,
    schema,
    user: authContext.user,
    session: authContext.session,
    isAuthenticated: authContext.isAuthenticated,
    permissions: authContext.permissions,
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
  if (!roles.includes(user.userType)) {
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