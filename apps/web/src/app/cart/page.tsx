'use client';

import React, { useEffect } from 'react';
import { ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCart } from '@/stores/cart-store';
import { useCartOperations } from '@/hooks/use-cart-operations';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
  const {
    items,
    isEmpty,
    hasItems,
    itemCount,
    isLoading,
  } = useCart();

  const { clearCart, reloadCart, loadingStates } = useCartOperations();

  // Load cart data on mount
  useEffect(() => {
    reloadCart();
  }, []);

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  // Loading state
  if (isLoading && isEmpty) {
    return <CartPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/products"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center space-x-4">
              {hasItems && (
                <button
                  onClick={handleClearCart}
                  disabled={loadingStates.clearingCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {loadingStates.clearingCart ? 'Clearing...' : 'Clear Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="space-y-6">
                {/* Items Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Cart Items ({itemCount})
                  </h2>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      showWishlistButton={true}
                      showSellerInfo={true}
                      compact={false}
                    />
                  ))}
                </div>

                {/* Recommendations */}
                <RecommendedProducts />
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
              <div className="sticky top-6">
                <CartSummary
                  showCheckoutButton={true}
                  showShippingCalculator={true}
                  showCouponCode={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty Cart Component
const EmptyCart: React.FC = () => (
  <div className="text-center py-16">
    <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300" />
    <h3 className="mt-6 text-lg font-medium text-gray-900">Your cart is empty</h3>
    <p className="mt-2 text-gray-500">
      Looks like you haven't added any items to your cart yet.
    </p>
    <div className="mt-8 space-y-4">
      <Link
        href="/products"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Start Shopping
      </Link>
      <div className="text-sm text-gray-500">
        <p>New to WinMarket? Explore our featured categories:</p>
        <div className="flex justify-center space-x-4 mt-2">
          <Link href="/categories/electronics" className="text-blue-600 hover:text-blue-700">
            Electronics
          </Link>
          <Link href="/categories/fashion" className="text-blue-600 hover:text-blue-700">
            Fashion
          </Link>
          <Link href="/categories/home" className="text-blue-600 hover:text-blue-700">
            Home & Garden
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// Recommended Products Component (placeholder)
const RecommendedProducts: React.FC = () => (
  <div className="mt-8 pt-8 border-t border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 mb-6">You might also like</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Placeholder for recommended products */}
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="w-full h-32 bg-gray-100 rounded-md mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            <div className="h-6 bg-blue-100 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="text-center mt-6">
      <Link
        href="/products"
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        View All Products →
      </Link>
    </div>
  </div>
);

// Cart Page Skeleton Loader
const CartPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart Items Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="space-y-6">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                  <div className="w-24 space-y-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);