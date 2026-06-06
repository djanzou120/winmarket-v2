import { Request, Response } from 'express';
import { auth } from './better-auth';

// Better Auth API routes handler
export async function handleAuthRoutes(req: Request, res: Response) {
  try {
    return await auth.handler(req, res);
  } catch (error) {
    console.error('Auth route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions for auth middleware
export async function verifySession(sessionToken: string | undefined) {
  if (!sessionToken) return null;

  try {
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });

    return session?.data || null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const session = await verifySession(token);
    return session?.user || null;
  } catch (error) {
    console.error('User token verification error:', error);
    return null;
  }
}

// Enhanced auth context creation
export async function createAuthContext(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const sessionCookie = req.cookies?.['better-auth.session'];

  // Try both authorization header and session cookie
  const sessionToken = token || sessionCookie;
  const session = await verifySession(sessionToken);

  return {
    user: session?.user || null,
    session: session || null,
    isAuthenticated: !!session?.user,
    permissions: session?.user?.role === 'ADMIN' ? ['admin'] : [],
  };
}