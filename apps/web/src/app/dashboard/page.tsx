'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole } from '@/graphql/generated';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {user.userType === UserRole.Seller ? 'Seller' : 'Buyer'} Dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user.status}
                </span>
                {user.emailVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.userType === UserRole.Seller ? (
                    <>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📦</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Add Product</p>
                            <p className="text-xs text-gray-500">List a new item for sale</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📊</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">View Sales</p>
                            <p className="text-xs text-gray-500">Check your sales analytics</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">🚚</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Manage Delivery</p>
                            <p className="text-xs text-gray-500">Setup delivery options</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📋</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Orders</p>
                            <p className="text-xs text-gray-500">Manage customer orders</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">🛒</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Browse Products</p>
                            <p className="text-xs text-gray-500">Discover amazing products</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">📦</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">My Orders</p>
                            <p className="text-xs text-gray-500">Track your purchases</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">💳</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">My Wallet</p>
                            <p className="text-xs text-gray-500">Manage your payments</p>
                          </div>
                        </div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">⭐</div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Reviews</p>
                            <p className="text-xs text-gray-500">View and write reviews</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Profile
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="text-sm text-gray-600">
                      📱 {user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            {user.wallet && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Wallet
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available Balance</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${user.wallet.balance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Frozen Balance</span>
                      <span className="text-sm font-medium text-gray-600">
                        ${user.wallet.frozenBalance.toFixed(2)}
                      </span>
                    </div>
                    {user.userType === UserRole.Seller && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Earnings</span>
                          <span className="text-sm font-medium text-green-600">
                            ${user.wallet.totalEarnings.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="text-sm font-medium text-red-600">
                        ${user.wallet.totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white text-sm py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Add Funds
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="text-sm text-gray-500">
                  No recent activity
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}