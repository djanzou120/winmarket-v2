'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { UserRole } from '@/graphql/generated';
import toast from 'react-hot-toast';

interface UseRequireAuthOptions {
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

/**
 * Hook to require authentication for protected routes
 * Redirects to login page if not authenticated
 * Optionally checks for specific roles
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/auth/login', allowedRoles } = options;
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Store intended destination
        const currentPath = window.location.pathname;
        if (currentPath !== redirectTo) {
          sessionStorage.setItem('winmarket_redirect_after_login', currentPath);
        }

        toast.error('Please log in to access this page');
        router.push(redirectTo);
        return;
      }

      // Check role permissions if specified
      if (allowedRoles && user && !allowedRoles.includes(user.userType)) {
        toast.error('You do not have permission to access this page');
        router.push('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, user, router, redirectTo, allowedRoles]);

  return {
    user,
    loading,
    isAuthenticated,
    isAuthorized: allowedRoles ? allowedRoles.includes(user?.userType as UserRole) : isAuthenticated,
  };
}

/**
 * Hook to require seller role
 */
export function useRequireSeller(options: Omit<UseRequireAuthOptions, 'allowedRoles'> = {}) {
  return useRequireAuth({
    ...options,
    allowedRoles: [UserRole.Seller, UserRole.Admin],
  });
}

/**
 * Hook to require admin role
 */
export function useRequireAdmin(options: Omit<UseRequireAuthOptions, 'allowedRoles'> = {}) {
  return useRequireAuth({
    ...options,
    allowedRoles: [UserRole.Admin],
  });
}

/**
 * Hook to redirect authenticated users (for login/register pages)
 */
export function useRequireGuest(redirectTo: string = '/dashboard') {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check for stored redirect destination
      const savedRedirect = sessionStorage.getItem('winmarket_redirect_after_login');
      if (savedRedirect) {
        sessionStorage.removeItem('winmarket_redirect_after_login');
        router.push(savedRedirect);
      } else {
        router.push(redirectTo);
      }
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  return {
    loading,
    isAuthenticated,
  };
}