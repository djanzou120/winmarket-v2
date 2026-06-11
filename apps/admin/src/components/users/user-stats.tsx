'use client';

import { Users, UserCheck, UserX, Crown, TrendingUp, TrendingDown } from 'lucide-react';

interface User {
  id: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
}

interface UserStatsProps {
  users: User[];
  loading: boolean;
}

export function UserStats({ users, loading }: UserStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'ACTIVE').length;
  const suspendedUsers = users.filter(user => user.status === 'SUSPENDED').length;
  const adminUsers = users.filter(user => user.role === 'ADMIN').length;

  // Calculate growth (mock calculation for last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsers = users.filter(user =>
    new Date(user.createdAt) >= thirtyDaysAgo
  ).length;

  const growthRate = totalUsers > 0 ? ((recentUsers / totalUsers) * 100) : 0;

  const stats = [
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: `+${recentUsers} this month`,
      changeType: recentUsers > 0 ? 'increase' : 'neutral',
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Active Users',
      value: activeUsers.toLocaleString(),
      change: `${((activeUsers / totalUsers) * 100).toFixed(1)}% of total`,
      changeType: 'neutral',
      icon: UserCheck,
      color: 'green',
    },
    {
      name: 'Suspended Users',
      value: suspendedUsers.toLocaleString(),
      change: suspendedUsers > 0 ? 'Requires attention' : 'All clear',
      changeType: suspendedUsers > 0 ? 'decrease' : 'neutral',
      icon: UserX,
      color: suspendedUsers > 0 ? 'red' : 'gray',
    },
    {
      name: 'Admin Users',
      value: adminUsers.toLocaleString(),
      change: 'Authorized personnel',
      changeType: 'neutral',
      icon: Crown,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      purple: 'text-purple-600 bg-purple-100',
      gray: 'text-gray-600 bg-gray-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);

        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' && (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              )}
              {stat.changeType === 'decrease' && (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : stat.changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}