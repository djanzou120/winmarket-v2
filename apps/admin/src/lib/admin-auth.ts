'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR';
  permissions: AdminPermission[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface AdminPermission {
  resource: string;
  actions: ('CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MODERATE' | 'EXPORT')[];
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
  permissions: AdminPermission[];
  exp: number;
  iat: number;
}

class AdminAuthService {
  private readonly TOKEN_KEY = 'admin_token';
  private readonly REFRESH_KEY = 'admin_refresh_token';

  async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { user, token, refreshToken } = await response.json();

      // Store tokens
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.REFRESH_KEY, refreshToken);

      return { user, token };
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_KEY);
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const { token } = await response.json();
      localStorage.setItem(this.TOKEN_KEY, token);
      return token;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  decodeToken(token: string): AdminTokenPayload | null {
    try {
      return jwtDecode<AdminTokenPayload>(token);
    } catch {
      return null;
    }
  }

  isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return false;

    const now = Date.now() / 1000;
    return payload.exp > now;
  }

  getCurrentUser(): AdminUser | null {
    const token = this.getToken();
    if (!token || !this.isTokenValid(token)) return null;

    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as AdminUser['role'],
      permissions: payload.permissions,
    };
  }

  hasPermission(resource: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admins have all permissions
    if (user.role === 'SUPER_ADMIN') return true;

    // Check specific permissions
    const permission = user.permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action as any) || false;
  }

  canAccessRoute(route: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Route-based access control
    const routePermissions: Record<string, { resource: string; action: string }> = {
      '/dashboard': { resource: 'DASHBOARD', action: 'READ' },
      '/dashboard/users': { resource: 'USERS', action: 'READ' },
      '/dashboard/products': { resource: 'PRODUCTS', action: 'READ' },
      '/dashboard/orders': { resource: 'ORDERS', action: 'READ' },
      '/dashboard/transactions': { resource: 'TRANSACTIONS', action: 'READ' },
      '/dashboard/analytics': { resource: 'ANALYTICS', action: 'READ' },
      '/dashboard/moderation': { resource: 'MODERATION', action: 'READ' },
      '/dashboard/settings': { resource: 'SYSTEM', action: 'READ' },
      '/dashboard/sellers': { resource: 'SELLERS', action: 'READ' },
      '/dashboard/communications': { resource: 'COMMUNICATIONS', action: 'READ' },
    };

    const routePerm = routePermissions[route];
    if (!routePerm) return true; // Allow unknown routes by default

    return this.hasPermission(routePerm.resource, routePerm.action);
  }
}

export const adminAuth = new AdminAuthService();

// React hook for admin authentication
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = adminAuth.getToken();
      if (token && adminAuth.isTokenValid(token)) {
        const currentUser = adminAuth.getCurrentUser();
        setUser(currentUser);
      } else {
        // Try to refresh token
        const newToken = await adminAuth.refreshToken();
        if (newToken) {
          const currentUser = adminAuth.getCurrentUser();
          setUser(currentUser);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await adminAuth.login(email, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await adminAuth.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    hasPermission: adminAuth.hasPermission.bind(adminAuth),
    canAccessRoute: adminAuth.canAccessRoute.bind(adminAuth),
  };
}