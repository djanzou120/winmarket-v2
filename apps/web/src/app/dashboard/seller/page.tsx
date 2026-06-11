'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole } from '@/graphql/generated';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SellerStats } from '@/components/seller/SellerStats';
import { SellerOnboarding } from '@/components/seller/SellerOnboarding';
import { InventoryManagement } from '@/components/seller/InventoryManagement';
import { useState } from 'react';

// GraphQL query for seller dashboard data
const SELLER_DASHBOARD_QUERY = gql`
  query SellerDashboard {
    me {
      id
      firstName
      lastName
      wallet {
        totalEarnings
        balance
      }
    }
    myProducts(pagination: { limit: 5, offset: 0 }) {
      edges {
        node {
          id
          title
          price
          stock
          status
          images
        }
      }
      totalCount
    }
    myOrders(pagination: { limit: 5, offset: 0 }) {
      edges {
        node {
          id
          orderNumber
          status
          total
          createdAt
          items {
            product {
              title
            }
            quantity
          }
        }
      }
      totalCount
    }
  }
`;

export default function SellerDashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data, loading, error } = useQuery(SELLER_DASHBOARD_QUERY, {
    skip: !isAuthenticated || user?.userType !== UserRole.Seller,
    errorPolicy: 'all'
  });

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auth check
  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Role check - redirect non-sellers
  if (user.userType !== UserRole.Seller) {
    redirect('/dashboard');
  }

  const stats = {
    totalProducts: data?.myProducts?.totalCount || 0,
    totalOrders: data?.myOrders?.totalCount || 0,
    totalEarnings: data?.me?.wallet?.totalEarnings || 0,
    pendingOrders: data?.myOrders?.edges?.filter((edge: any) =>
      ['PENDING', 'CONFIRMED'].includes(edge.node.status)
    ).length || 0
  };

  const recentProducts = data?.myProducts?.edges?.map((edge: any) => edge.node) || [];
  const recentOrders = data?.myOrders?.edges?.map((edge: any) => edge.node) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Seller Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user.firstName}! Here's what's happening with your store.
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard/seller/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </Link>
                <Link
                  href="/dashboard/seller/orders"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'analytics', name: 'Analytics' },
              { id: 'quick-actions', name: 'Quick Actions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📦</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Products
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalProducts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalOrders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">💰</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Earnings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${stats.totalEarnings.toFixed(2)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-bold">⏳</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pendingOrders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Products */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Products
                    </h3>
                    <Link
                      href="/dashboard/seller/products"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {recentProducts.length > 0 ? (
                    recentProducts.map((product: any) => (
                      <li key={product.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {product.images?.[0] ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={product.images[0]}
                                alt={product.title}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">📦</span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ${product.price} • Stock: {product.stock}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 sm:px-6 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm">No products yet</p>
                        <Link
                          href="/dashboard/seller/products/new"
                          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Add your first product
                        </Link>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Recent Orders */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Orders
                    </h3>
                    <Link
                      href="/dashboard/seller/orders"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View all
                    </Link>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <li key={order.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.map((item: any) => item.product.title).join(', ')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              ${order.total.toFixed(2)}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'PENDING' || order.status === 'CONFIRMED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-8 sm:px-6 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm">No orders yet</p>
                        <p className="text-xs mt-1">Orders will appear here when customers purchase your products</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    href="/dashboard/seller/products/new"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-2xl">➕</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">Add Product</p>
                      <p className="text-sm text-gray-500 truncate">List a new item</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/seller/products"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">Manage Products</p>
                      <p className="text-sm text-gray-500 truncate">Edit inventory</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/seller/orders"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">Process Orders</p>
                      <p className="text-sm text-gray-500 truncate">Fulfill orders</p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/seller/analytics"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">View Analytics</p>
                      <p className="text-sm text-gray-500 truncate">Sales reports</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <SellerStats />
          </div>
        )}

        {activeTab === 'quick-actions' && (
          <div className="space-y-8">
            {/* Onboarding Section */}
            <SellerOnboarding />

            {/* Inventory Quick View */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Inventory Overview
                </h3>
              </div>
              <div className="p-6">
                <InventoryManagement showHeader={false} compact={true} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Store Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Product Management</h4>
                  <div className="space-y-2">
                    <Link href="/dashboard/seller/products/new" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Add New Product
                    </Link>
                    <Link href="/dashboard/seller/products" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Manage Inventory
                    </Link>
                    <Link href="/dashboard/seller/products?tab=bulk" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Bulk Operations
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Order Processing</h4>
                  <div className="space-y-2">
                    <Link href="/dashboard/seller/orders?status=pending" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Process Pending Orders
                    </Link>
                    <Link href="/dashboard/seller/orders?status=confirmed" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Ready to Ship
                    </Link>
                    <Link href="/dashboard/seller/delivery" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Manage Delivery
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Business Insights</h4>
                  <div className="space-y-2">
                    <Link href="/dashboard/seller/analytics" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Sales Analytics
                    </Link>
                    <Link href="/dashboard/seller/analytics?view=products" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Product Performance
                    </Link>
                    <Link href="/dashboard/seller/support" className="block text-blue-600 hover:text-blue-700 text-sm">
                      • Help & Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Some information may not be up to date. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}