'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: string;
  };
}

export function AdminRouteGuard({ children, requiredPermission }: AdminRouteGuardProps) {
  const { user, loading, canAccessRoute, hasPermission } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    // Check route-specific permissions
    if (!canAccessRoute(pathname)) {
      router.push('/unauthorized');
      return;
    }

    // Check specific permission requirements
    if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, pathname, canAccessRoute, hasPermission, requiredPermission, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or no permission
  if (!user || !canAccessRoute(pathname)) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}