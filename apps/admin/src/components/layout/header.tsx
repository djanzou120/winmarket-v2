'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User, LogOut, Settings as SettingsIcon, Shield, ChevronDown } from 'lucide-react';
import { useAdminAuth } from '@/lib/admin-auth';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, products, orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-gray-900 relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Admin avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <div className="text-sm font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'Admin User'}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role?.replace('_', ' ') || 'Admin'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/dashboard/settings/profile');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Profile Settings
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/dashboard/settings');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  System Settings
                </button>

                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}