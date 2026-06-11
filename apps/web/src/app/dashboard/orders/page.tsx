'use client';

import React, { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@apollo/client';
import { MyOrdersDocument, OrderStatus, type Order } from '@/graphql/generated';
import OrderCard from '@/components/orders/OrderCard';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState('all');

  const { data, loading, error, fetchMore } = useQuery(MyOrdersDocument, {
    variables: {
      pagination: { limit: 10, offset: 0 },
    },
    fetchPolicy: 'cache-and-network',
  });

  const orders: any[] = data?.myOrders?.edges?.map((edge: any) => edge.node) || [];
  const hasNextPage = data?.myOrders?.pageInfo?.hasNextPage || false;

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = !searchTerm ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item: any) =>
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all' && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - orderDate.getTime();

      switch (dateFilter) {
        case 'week':
          matchesDate = timeDiff <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          matchesDate = timeDiff <= 30 * 24 * 60 * 60 * 1000;
          break;
        case 'quarter':
          matchesDate = timeDiff <= 90 * 24 * 60 * 60 * 1000;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Load more orders
  const handleLoadMore = () => {
    fetchMore({
      variables: {
        pagination: { limit: 10, offset: orders.length },
      },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load orders</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
                My Orders
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your order history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="sm:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'ALL' || dateFilter !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Date: {dateFilter}
                  <button
                    onClick={() => setDateFilter('all')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <OrdersPageSkeleton />
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {data?.myOrders?.totalCount || 0} orders
            </div>

            {/* Orders Grid */}
            <div className="grid gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order as Partial<Order>}
                  viewMode="buyer"
                />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && !loading && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Load More Orders
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyOrdersState
            hasFilters={statusFilter !== 'ALL' || dateFilter !== 'all' || searchTerm !== ''}
            onClearFilters={() => {
              setStatusFilter('ALL');
              setDateFilter('all');
              setSearchTerm('');
            }}
          />
        )}
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyOrdersStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const EmptyOrdersState: React.FC<EmptyOrdersStateProps> = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-16">
    <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
      <FunnelIcon className="h-full w-full" />
    </div>

    {hasFilters ? (
      <>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders match your filters</h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search terms or filters to find what you're looking for.
        </p>
        <button
          onClick={onClearFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          Clear all filters
        </button>
      </>
    ) : (
      <>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <a
          href="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </a>
      </>
    )}
  </div>
);

// Orders Page Skeleton
const OrdersPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);