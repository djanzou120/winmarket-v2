'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { SearchBar } from '@/components/products/SearchBar';
import { SellerNotifications } from '@/components/seller/SellerNotifications';
import { UserRole } from '@/graphql/generated';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  Grid,
  Tag,
  Heart,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Truck,
  Users
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount] = useState(0); // This would come from cart state/context

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    }
  };

  const navigation = [
    { name: 'All Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Grid },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">WinMarket</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8 items-center">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products, brands, or categories..."
              className="w-full"
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Seller Notifications (only for sellers) */}
            {user && user.userType === UserRole.Seller && (
              <SellerNotifications compact={true} showHeader={false} />
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md transition-colors">
                  <User className="w-6 h-6" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user.firstName || 'Profile'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 hidden group-hover:block">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Grid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>

                    {/* Seller-specific navigation */}
                    {user.userType === UserRole.Seller && (
                      <>
                        <div className="px-4 py-1">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Seller Tools
                          </div>
                        </div>
                        <Link
                          href="/dashboard/seller"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Store className="w-4 h-4" />
                          <span>Seller Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/seller/products"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Package className="w-4 h-4" />
                          <span>Manage Products</span>
                        </Link>
                        <Link
                          href="/dashboard/seller/orders"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Users className="w-4 h-4" />
                          <span>Customer Orders</span>
                        </Link>
                        <Link
                          href="/dashboard/seller/analytics"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Sales Analytics</span>
                        </Link>
                        <Link
                          href="/dashboard/seller/delivery"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Delivery Setup</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}

                    {/* Buyer navigation */}
                    <Link
                      href={user.userType === UserRole.Seller ? "/dashboard/seller/orders" : "/dashboard/orders"}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" />
                      <span>{user.userType === UserRole.Seller ? 'All Orders' : 'My Orders'}</span>
                    </Link>

                    <Link
                      href="/dashboard/wallet"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="w-4 h-4 text-center">$</span>
                      <span>Wallet</span>
                    </Link>

                    <Link
                      href="/favorites"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Favorites</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden px-4 pb-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search products..."
            className="w-full"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Popular Categories */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Popular Categories
              </h3>
              {[
                { name: 'Electronics', href: '/categories/electronics' },
                { name: 'Fashion', href: '/categories/fashion' },
                { name: 'Home & Garden', href: '/categories/home-garden' },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  <Tag className="w-4 h-4" />
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}