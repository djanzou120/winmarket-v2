'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, DocumentTextIcon, TruckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartOperations } from '@/hooks/use-cart-operations';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartOperations();

  const orderNumber = searchParams.get('order') || 'ORD-2024-001';
  const orderTotal = searchParams.get('total') || '124.97';

  // Clear cart on successful order
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-gray-900">${orderTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600">Paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span className="font-medium text-blue-600">Processing</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Link
            href={`/orders/${orderNumber}`}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            View Order Details
          </Link>

          <Link
            href="/dashboard/orders"
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <TruckIcon className="w-5 h-5 mr-2" />
            Track All Orders
          </Link>

          <Link
            href="/products"
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ShoppingBagIcon className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Additional Information */}
        <div className="text-left space-y-4 text-sm text-gray-600">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• You'll receive an email confirmation shortly</li>
              <li>• Your order will be processed within 24 hours</li>
              <li>• You'll get shipping updates via email and SMS</li>
              <li>• Track your order anytime in your dashboard</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-gray-600 mb-2">
              If you have any questions about your order, please contact us:
            </p>
            <div className="space-y-1 text-gray-600">
              <p>📧 Email: support@winmarket.com</p>
              <p>📞 Phone: +1 (555) 123-4567</p>
              <p>💬 Live Chat: Available 24/7</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>
            Order confirmation sent to your email. Please keep your order number for reference.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessPageSkeleton />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

// Loading skeleton
const CheckoutSuccessPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 animate-pulse mb-6" />
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 mx-8" />
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse mb-3" />
      ))}
    </div>
  </div>
);