'use client';

import { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  MoreHorizontal
} from 'lucide-react';
import { AdminRouteGuard } from '@/components/auth/admin-route-guard';
import { UserTable } from '@/components/users/user-table';
import { UserFilters } from '@/components/users/user-filters';
import { UserStats } from '@/components/users/user-stats';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders?: number;
  totalSpent?: number;
  totalEarned?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for development - replace with real API calls
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john.doe@email.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'BUYER',
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2024-06-01T08:15:00Z',
          totalOrders: 12,
          totalSpent: 1250.00,
        },
        {
          id: '2',
          email: 'jane.seller@email.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'SELLER',
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: '2024-02-20T14:20:00Z',
          lastLoginAt: '2024-06-06T16:45:00Z',
          totalOrders: 45,
          totalEarned: 8750.00,
        },
        {
          id: '3',
          email: 'admin@winmarket.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: '2024-01-01T00:00:00Z',
          lastLoginAt: '2024-06-07T09:30:00Z',
        },
        {
          id: '4',
          email: 'suspended.user@email.com',
          firstName: 'Suspended',
          lastName: 'User',
          role: 'BUYER',
          status: 'SUSPENDED',
          emailVerified: false,
          createdAt: '2024-05-10T12:00:00Z',
          totalOrders: 3,
          totalSpent: 150.00,
        }
      ];

      setUsers(mockUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleExportUsers = () => {
    // TODO: Implement user export functionality
    console.log('Exporting users...');
  };

  const handleBulkAction = (action: string, userIds: string[]) => {
    // TODO: Implement bulk actions (suspend, activate, delete, etc.)
    console.log('Bulk action:', action, 'for users:', userIds);
  };

  return (
    <AdminRouteGuard requiredPermission={{ resource: 'USERS', action: 'READ' }}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UsersIcon className="w-8 h-8 mr-3 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage users, roles, and permissions across the platform
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleExportUsers}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* User Statistics */}
        <UserStats users={users} loading={loading} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="BUYER">Buyers</option>
                <option value="SELLER">Sellers</option>
                <option value="ADMIN">Admins</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DELETED">Deleted</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <UserFilters
              onApplyFilters={(filters) => {
                // TODO: Apply advanced filters
                console.log('Applying filters:', filters);
                setShowFilters(false);
              }}
              onClearFilters={() => {
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
                setSearchTerm('');
                setShowFilters(false);
              }}
            />
          )}
        </div>

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onBulkAction={handleBulkAction}
        />
      </div>
    </AdminRouteGuard>
  );
}