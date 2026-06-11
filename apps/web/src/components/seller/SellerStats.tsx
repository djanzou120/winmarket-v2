'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// GraphQL query for seller analytics
const SELLER_ANALYTICS_QUERY = gql`
  query SellerAnalytics($period: String!) {
    sellerStats(period: $period) {
      totalRevenue
      totalOrders
      totalProducts
      conversionRate
      averageOrderValue
      revenueGrowth
      orderGrowth
      topProducts {
        productId
        title
        revenue
        orders
        units
      }
      revenueByMonth {
        month
        revenue
        orders
      }
    }
    me {
      wallet {
        totalEarnings
        balance
        frozenBalance
      }
    }
  }
`;

interface StatsPeriod {
  value: string;
  label: string;
}

const periods: StatsPeriod[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
];

export function SellerStats() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeChart, setActiveChart] = useState('revenue');

  const { data, loading, error } = useQuery(SELLER_ANALYTICS_QUERY, {
    variables: { period: selectedPeriod },
    errorPolicy: 'all'
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading analytics
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Unable to load your analytics data. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.sellerStats || {};
  const wallet = data?.me?.wallet || {};

  // Prepare chart data
  const revenueData = {
    labels: stats.revenueByMonth?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats.revenueByMonth?.map((item: any) => item.revenue) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const ordersData = {
    labels: stats.revenueByMonth?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: 'Orders',
        data: stats.revenueByMonth?.map((item: any) => item.orders) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const topProductsData = {
    labels: stats.topProducts?.slice(0, 5).map((p: any) => p.title) || [],
    datasets: [
      {
        data: stats.topProducts?.slice(0, 5).map((p: any) => p.revenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
            Sales Analytics
          </h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="mt-1 block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(stats.totalRevenue || 0).toFixed(2)}
              </p>
              {stats.revenueGrowth !== undefined && (
                <p className={`text-xs ${
                  stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% from previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalOrders || 0}
              </p>
              {stats.orderGrowth !== undefined && (
                <p className={`text-xs ${
                  stats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.orderGrowth >= 0 ? '+' : ''}{stats.orderGrowth.toFixed(1)}% from previous period
                </p>
              )}
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Order Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(stats.averageOrderValue || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Per order
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(stats.conversionRate || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                Visitors to buyers
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-xl font-semibold text-green-600">
              ${(wallet.balance || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Frozen Balance</p>
            <p className="text-xl font-semibold text-yellow-600">
              ${(wallet.frozenBalance || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <p className="text-xl font-semibold text-blue-600">
              ${(wallet.totalEarnings || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue/Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeChart === 'revenue' ? 'Revenue' : 'Orders'} Trend
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart('revenue')}
                className={`px-3 py-1 text-xs rounded-full ${
                  activeChart === 'revenue'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChart('orders')}
                className={`px-3 py-1 text-xs rounded-full ${
                  activeChart === 'orders'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
          <div className="h-64">
            {activeChart === 'revenue' ? (
              <Line data={revenueData} options={chartOptions} />
            ) : (
              <Bar data={ordersData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="h-64">
            <Doughnut
              data={topProductsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topProducts?.map((product: any, index: number) => (
                <tr key={product.productId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.orders > 0 ? (product.revenue / product.orders).toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!stats.topProducts || stats.topProducts.length === 0) && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No sales data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}