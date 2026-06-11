'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole, OrderStatus } from '@/graphql/generated';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { redirect } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  CheckIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// GraphQL queries and mutations
const MY_ORDERS_QUERY = gql`
  query MySellerOrders($pagination: PaginationInput, $filter: OrderFilter) {
    myOrders(pagination: $pagination, filter: $filter) {
      edges {
        node {
          id
          orderNumber
          status
          total
          currency
          createdAt
          updatedAt
          shippingAddress {
            name
            street
            city
            state
            postalCode
            country
            phone
          }
          user {
            id
            firstName
            lastName
            email
          }
          items {
            id
            quantity
            unitPrice
            totalPrice
            product {
              id
              title
              slug
              images
            }
            productVariant {
              id
              name
            }
          }
          deliveryProvider {
            id
            name
            trackingNumber
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export default function SellerOrdersPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [, setSelectedOrder] = useState<string | null>(null);

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // Build filter for GraphQL query
  const graphQLFilter = useMemo(() => {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.search) filter.orderNumber = { contains: filters.search };
    if (filters.startDate) filter.createdAfter = filters.startDate;
    if (filters.endDate) filter.createdBefore = filters.endDate;
    return filter;
  }, [filters]);

  const { data, loading, error, refetch } = useQuery(MY_ORDERS_QUERY, {
    variables: {
      pagination: { limit: itemsPerPage, offset },
      filter: graphQLFilter
    },
    skip: !isAuthenticated || user?.userType !== UserRole.Seller,
    errorPolicy: 'all'
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION, {
    onCompleted: () => {
      toast.success('Order status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    }
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
    return null;
  }

  // Role check
  if (user.userType !== UserRole.Seller) {
    redirect('/dashboard');
  }

  const orders = data?.myOrders?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.myOrders?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus({
      variables: {
        id: orderId,
        status: newStatus
      }
    });
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: any) => o.id));
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.Confirmed:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.Processing:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.Shipped:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.Delivered:
        return 'bg-green-100 text-green-800';
      case OrderStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case OrderStatus.Refunded:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.Pending:
        return OrderStatus.Confirmed;
      case OrderStatus.Confirmed:
        return OrderStatus.Processing;
      case OrderStatus.Processing:
        return OrderStatus.Shipped;
      case OrderStatus.Shipped:
        return OrderStatus.Delivered;
      default:
        return null;
    }
  };

  const canAdvanceStatus = (status: OrderStatus) => {
    return [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped].includes(status);
  };

  const getPriorityLevel = (order: any) => {
    const daysSinceCreated = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    if (order.status === OrderStatus.Pending && daysSinceCreated > 2) return 'high';
    if (order.status === OrderStatus.Confirmed && daysSinceCreated > 1) return 'high';
    if (daysSinceCreated > 7) return 'medium';
    return 'low';
  };

  // Calculate order statistics
  const orderStats = useMemo(() => {
    const pending = orders.filter((o: any) => o.status === OrderStatus.Pending).length;
    const processing = orders.filter((o: any) => o.status === OrderStatus.Processing).length;
    const shipped = orders.filter((o: any) => o.status === OrderStatus.Shipped).length;
    const total = orders.reduce((sum: any, order: any) => sum + order.total, 0);

    return { pending, processing, shipped, total };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Process and track customer orders
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Print Labels
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orderStats.pending}
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
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <div className="h-5 w-5 text-white flex items-center justify-center text-xs font-bold">⚙️</div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Processing
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orderStats.processing}
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <TruckIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Shipped
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orderStats.shipped}
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
                    <span className="text-white text-xs font-bold">$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Order Value
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${orderStats.total.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 lg:max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex space-x-2">
              {([
                { label: 'All', status: undefined },
                { label: 'Pending', status: OrderStatus.Pending },
                { label: 'Processing', status: OrderStatus.Processing },
                { label: 'Shipped', status: OrderStatus.Shipped }
              ] as { label: string; status: OrderStatus | undefined }[]).map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => {
                    setFilters(prev => {
                      const next = { ...prev };
                      if (filter.status) {
                        next.status = filter.status;
                      } else {
                        delete next.status;
                      }
                      return next;
                    });
                  }}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filters.status === filter.status
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      status: e.target.value as OrderStatus || undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value={OrderStatus.Pending}>Pending</option>
                    <option value={OrderStatus.Confirmed}>Confirmed</option>
                    <option value={OrderStatus.Processing}>Processing</option>
                    <option value={OrderStatus.Shipped}>Shipped</option>
                    <option value={OrderStatus.Delivered}>Delivered</option>
                    <option value={OrderStatus.Cancelled}>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800">
                  {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Bulk confirm orders
                    selectedOrders.forEach(orderId => {
                      const order = orders.find((o: any) => o.id === orderId);
                      if (order && order.status === OrderStatus.Pending) {
                        handleStatusUpdate(orderId, OrderStatus.Confirmed);
                      }
                    });
                  }}
                  className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded text-green-700 bg-white hover:bg-green-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Confirm Selected
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order: any) => {
                  const priority = getPriorityLevel(order);
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {priority === 'high' && (
                            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex items-center text-sm">
                              {item.product.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.title}
                                  className="h-8 w-8 rounded object-cover mr-2"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.product.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity}
                                  {item.productVariant && ` • ${item.productVariant.name}`}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {order.deliveryProvider?.trackingNumber && (
                          <div className="text-xs text-gray-500 mt-1">
                            Track: {order.deliveryProvider.trackingNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          {canAdvanceStatus(order.status) && nextStatus && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, nextStatus)}
                              className="text-green-600 hover:text-green-900"
                              title={`Mark as ${nextStatus}`}
                            >
                              <ChevronRightIcon className="h-5 w-5" />
                            </button>
                          )}

                          {order.status === OrderStatus.Processing && (
                            <Link
                              href={`/dashboard/seller/orders/${order.id}/shipping`}
                              className="text-purple-600 hover:text-purple-900"
                              title="Add shipping info"
                            >
                              <TruckIcon className="h-5 w-5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {Object.keys(filters).length > 0 ? (
                  <>
                    <p className="text-lg mb-2">No orders match your filters</p>
                    <button
                      onClick={() => setFilters({})}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear filters to see all orders
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-2">No orders yet</p>
                    <p className="text-sm">Orders will appear here when customers purchase your products</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{offset + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(offset + itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load orders. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}