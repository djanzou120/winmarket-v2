'use client';

import { useState } from 'react';
import { Calendar, X, Check, Filter } from 'lucide-react';

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  emailVerified: boolean | null;
  lastLoginDays: number | null;
  orderCount: {
    min: number | null;
    max: number | null;
  };
  spentAmount: {
    min: number | null;
    max: number | null;
  };
}

interface UserFiltersProps {
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function UserFilters({ onApplyFilters, onClearFilters }: UserFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: '',
      end: '',
    },
    emailVerified: null,
    lastLoginDays: null,
    orderCount: {
      min: null,
      max: null,
    },
    spentAmount: {
      min: null,
      max: null,
    },
  });

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      emailVerified: null,
      lastLoginDays: null,
      orderCount: { min: null, max: null },
      spentAmount: { min: null, max: null },
    });
    onClearFilters();
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedFilter = (parent: string, child: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof FilterOptions] as any),
        [child]: value,
      },
    }));
  };

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Advanced Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Registration Date</label>
          <div className="space-y-2">
            <input
              type="date"
              placeholder="Start date"
              value={filters.dateRange.start}
              onChange={(e) => updateNestedFilter('dateRange', 'start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              placeholder="End date"
              value={filters.dateRange.end}
              onChange={(e) => updateNestedFilter('dateRange', 'end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email Verification */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Email Status</label>
          <select
            value={filters.emailVerified === null ? '' : filters.emailVerified.toString()}
            onChange={(e) => updateFilter('emailVerified',
              e.target.value === '' ? null : e.target.value === 'true'
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>

        {/* Last Login */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Last Login</label>
          <select
            value={filters.lastLoginDays || ''}
            onChange={(e) => updateFilter('lastLoginDays',
              e.target.value ? parseInt(e.target.value) : null
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any time</option>
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Order Count */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Order Count</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.orderCount.min || ''}
              onChange={(e) => updateNestedFilter('orderCount', 'min',
                e.target.value ? parseInt(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.orderCount.max || ''}
              onChange={(e) => updateNestedFilter('orderCount', 'max',
                e.target.value ? parseInt(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Spent Amount */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Total Spent ($)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.spentAmount.min || ''}
              onChange={(e) => updateNestedFilter('spentAmount', 'min',
                e.target.value ? parseFloat(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.spentAmount.max || ''}
              onChange={(e) => updateNestedFilter('spentAmount', 'max',
                e.target.value ? parseFloat(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          <Check className="w-4 h-4 mr-2" />
          Apply Filters
        </button>
      </div>
    </div>
  );
}