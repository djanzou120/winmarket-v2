'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TagIcon, TruckIcon, CalculatorIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/stores/cart-store';
import { useCartOperations } from '@/hooks/use-cart-operations';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  showShippingCalculator?: boolean;
  showCouponCode?: boolean;
  className?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  showCheckoutButton = true,
  showShippingCalculator = true,
  showCouponCode = true,
  className = '',
}) => {
  const {
    items,
    subtotal,
    itemCount,
    currency,
    couponCode,
    discount,
    formattedSubtotal,
    formattedDiscount,
    setCoupon,
    getTotalWithTax,
  } = useCart();

  const { isLoading } = useCartOperations();

  // Local state for form inputs
  const [couponInput, setCouponInput] = useState(couponCode || '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState('standard');

  // Tax calculation (this could be based on location)
  const taxRate = 0.1; // 10% tax rate for demo
  const taxAmount = getTotalWithTax(taxRate) - subtotal + discount;

  // Shipping options
  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
    { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 business day' },
  ];

  // Update shipping cost when option changes
  useEffect(() => {
    const option = shippingOptions.find(opt => opt.id === selectedShipping);
    setShippingCost(option?.price || 0);
  }, [selectedShipping]);

  // Final total calculation
  const finalTotal = subtotal - discount + taxAmount + shippingCost;

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      // Simulate coupon validation and discount calculation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock coupon logic
      const mockCoupons: Record<string, { discount: number; type: 'fixed' | 'percentage' }> = {
        'SAVE10': { discount: 10, type: 'percentage' },
        'SAVE20': { discount: 20, type: 'fixed' },
        'FREESHIP': { discount: shippingCost, type: 'fixed' },
      };

      const coupon = mockCoupons[couponInput.toUpperCase()];
      if (coupon) {
        const discountAmount = coupon.type === 'percentage'
          ? subtotal * (coupon.discount / 100)
          : coupon.discount;

        setCoupon(couponInput.toUpperCase(), Math.min(discountAmount, subtotal));
      } else {
        throw new Error('Invalid coupon code');
      }
    } catch (error) {
      console.error('Failed to apply coupon:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setCoupon(null, 0);
    setCouponInput('');
  };

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Check if any items require shipping
  const hasShippableItems = items.some(item => item.product.shippingRequired);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-6 ${className}`}>
      {/* Order Summary Header */}
      <div className="flex items-center space-x-2">
        <CalculatorIcon className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
      </div>

      {/* Items Count */}
      <div className="text-sm text-gray-600">
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </div>

      {/* Coupon Code Section */}
      {showCouponCode && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TagIcon className="w-4 h-4 text-gray-500" />
            <label htmlFor="coupon" className="text-sm font-medium text-gray-700">
              Promo Code
            </label>
          </div>

          {couponCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="text-sm font-medium text-green-800">{couponCode}</span>
                <p className="text-xs text-green-600">Discount applied</p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                id="coupon"
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Shipping Calculator */}
      {showShippingCalculator && hasShippableItems && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <TruckIcon className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Shipping Options
            </label>
          </div>

          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={selectedShipping === option.id}
                    onChange={(e) => setSelectedShipping(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.days}</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(option.price)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Order Breakdown */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formattedSubtotal}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-{formattedDiscount}</span>
          </div>
        )}

        {/* Shipping */}
        {hasShippableItems && shippingCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{formatPrice(shippingCost)}</span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">{formatPrice(taxAmount)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Savings Display */}
      {discount > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🎉 You're saving {formattedDiscount} with this order!
          </p>
        </div>
      )}

      {/* Checkout Button */}
      {showCheckoutButton && (
        <div className="space-y-3">
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCardIcon className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Link>

          <Link
            href="/products"
            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Payment Security */}
      <div className="text-center space-y-2 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🔒 Secure checkout powered by WinMarket
        </p>
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <span>We accept:</span>
          <span className="font-medium">Wallet • Card • Mobile Money</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;