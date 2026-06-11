'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole } from '@/graphql/generated';
import { redirect } from 'next/navigation';
import { ProductForm } from '@/components/seller/ProductForm';

export default function NewProductPage() {
  const { user, loading, isAuthenticated } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.userType !== UserRole.Seller) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Create a new product listing for your store
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductForm />
      </div>
    </div>
  );
}