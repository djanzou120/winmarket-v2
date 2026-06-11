'use client';

import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number;
  reportsByType: {
    [key: string]: number;
  };
  reportsByPriority: {
    [key: string]: number;
  };
}

interface ModerationStatsProps {
  stats: ModerationStats;
  loading: boolean;
}

export function ModerationStats({ stats, loading }: ModerationStatsProps) {
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

  const pendingUrgent = stats.reportsByPriority?.URGENT || 0;
  const resolutionRate = stats.totalReports > 0 ?
    ((stats.totalReports - stats.pendingReports) / stats.totalReports * 100) : 0;

  const mainStats = [
    {
      name: 'Total Reports',
      value: stats.totalReports.toLocaleString(),
      change: `${stats.resolvedToday} resolved today`,
      changeType: 'neutral',
      icon: Shield,
      color: 'blue',
    },
    {
      name: 'Pending Review',
      value: stats.pendingReports.toLocaleString(),
      change: pendingUrgent > 0 ? `${pendingUrgent} urgent` : 'No urgent reports',
      changeType: pendingUrgent > 0 ? 'urgent' : 'good',
      icon: Clock,
      color: pendingUrgent > 0 ? 'red' : 'yellow',
    },
    {
      name: 'Resolution Rate',
      value: `${resolutionRate.toFixed(1)}%`,
      change: 'Platform safety score',
      changeType: resolutionRate > 90 ? 'good' : resolutionRate > 75 ? 'neutral' : 'warning',
      icon: CheckCircle,
      color: resolutionRate > 90 ? 'green' : 'yellow',
    },
    {
      name: 'Avg Resolution Time',
      value: `${stats.averageResolutionTime}h`,
      change: stats.averageResolutionTime < 3 ? 'Excellent response time' : 'Could be improved',
      changeType: stats.averageResolutionTime < 3 ? 'good' : 'warning',
      icon: TrendingUp,
      color: stats.averageResolutionTime < 3 ? 'green' : 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      orange: 'text-orange-600 bg-orange-100',
      gray: 'text-gray-600 bg-gray-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const getChangeColorClass = (changeType: string) => {
    switch (changeType) {
      case 'good':
        return 'text-green-600';
      case 'urgent':
      case 'warning':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          const changeColorClass = getChangeColorClass(stat.changeType);

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

              <div className="mt-4">
                <span className={`text-sm ${changeColorClass}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Type */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.reportsByType).map(([type, count]) => {
              const percentage = (count / stats.totalReports) * 100;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.toLowerCase()}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reports by Priority */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Priority</h3>
          <div className="space-y-3">
            {Object.entries(stats.reportsByPriority).map(([priority, count]) => {
              const percentage = (count / stats.totalReports) * 100;
              const priorityColors = {
                URGENT: 'bg-red-500',
                HIGH: 'bg-orange-500',
                MEDIUM: 'bg-yellow-500',
                LOW: 'bg-gray-400',
              };
              const barColor = priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-400';

              return (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {priority.toLowerCase()}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className={`${barColor} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {stats.pendingReports > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Attention Required
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                You have {stats.pendingReports} pending reports that need review.
                {pendingUrgent > 0 && ` ${pendingUrgent} are marked as urgent.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}