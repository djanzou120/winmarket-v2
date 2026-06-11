'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import type { Order } from '@/graphql/generated';

interface OrderCardProps {
  order: Partial<Order>;
  viewMode?: 'buyer' | 'seller';
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  viewMode = 'buyer',
  className = ''
}) => {
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency || 'USD',
    }).format(price);
  };

  // Get status styling
  const getStatusStyling = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: ClockIcon,
          label: 'Pending'
        };
      case 'PROCESSING':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: ArrowPathIcon,
          label: 'Processing'
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: CheckCircleIcon,
          label: 'Confirmed'
        };
      case 'SHIPPED':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: TruckIcon,
          label: 'Shipped'
        };
      case 'DELIVERED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircleIcon,
          label: 'Delivered'
        };
      case 'CANCELLED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircleIcon,
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: ClockIcon,
          label: status || 'Unknown'
        };
    }
  };

  const statusStyling = getStatusStyling(order.status);
  const StatusIcon = statusStyling.icon;

  // Get payment status styling
  const getPaymentStatusStyling = (paymentStatus?: string) => {
    switch (paymentStatus?.toUpperCase()) {
      case 'COMPLETED':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'FAILED':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'PROCESSING':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const paymentStyling = getPaymentStatusStyling(order.paymentStatus);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Order Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyling.bg} ${statusStyling.text}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusStyling.label}
          </span>
        </div>
      </div>

      {/* Customer/Seller Info */}
      {viewMode === 'seller' && order.buyer ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Customer: {order.buyer.firstName} {order.buyer.lastName}
          </p>
        </div>
      ) : viewMode === 'buyer' && order.seller ? (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Seller: {order.seller.firstName} {order.seller.lastName}
          </p>
        </div>
      ) : null}

      {/* Order Items Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          {order.items && order.items.length > 0 ? (
            <>
              {/* Show first few item images */}
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                  >
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName || 'Product'}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-900 font-medium">
                  {order.itemCount || order.items.length} {(order.itemCount || order.items.length) === 1 ? 'item' : 'items'}
                </p>
                <p className="text-xs text-gray-500">
                  {order.items[0]?.productName}
                  {order.items.length > 1 && ` and ${order.items.length - 1} more`}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No items</p>
          )}
        </div>
      </div>

      {/* Payment and Delivery Info */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment:</span>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentStyling.bg} ${paymentStyling.text}`}>
            {order.paymentStatus}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tracking:</span>
            <span className="text-sm font-mono text-blue-600">
              {order.trackingNumber}
            </span>
          </div>
        )}

        {order.estimatedDelivery && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estimated Delivery:</span>
            <span className="text-sm text-gray-900">
              {formatDate(order.estimatedDelivery)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View Details
          </Link>

          {/* Tracking Link */}
          {order.trackingNumber && order.status === 'SHIPPED' && (
            <Link
              href={`/orders/${order.id}/tracking`}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              <TruckIcon className="w-4 h-4 mr-2" />
              Track Order
            </Link>
          )}

          {/* Cancel Button (only for pending orders) */}
          {order.status === 'PENDING' && (
            <button
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
        </div>

        {/* Reorder Button */}
        {order.status === 'DELIVERED' && viewMode === 'buyer' && (
          <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Reorder
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;