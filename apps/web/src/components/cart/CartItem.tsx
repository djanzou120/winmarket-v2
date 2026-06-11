'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/stores/cart-store';
import { useCartOperations } from '@/hooks/use-cart-operations';
import type { CartItem as CartItemType } from '@/graphql/generated';
import { toast } from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
  className?: string;
  showWishlistButton?: boolean;
  showSellerInfo?: boolean;
  compact?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  className = '',
  showWishlistButton = true,
  showSellerInfo = true,
  compact = false,
}) => {
  const { currency, getItemQuantity } = useCart();
  const { updateQuantity, removeItem, loadingStates } = useCartOperations();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentQuantity = getItemQuantity(item.productId, item.productVariantId || undefined);
  const isLoading = loadingStates.updatingCartItem || loadingStates.removingFromCart;

  // Handle quantity change
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > 99) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle move to wishlist (placeholder for now)
  const handleMoveToWishlist = () => {
    toast.success('Moved to wishlist (feature coming soon)');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Get primary image
  const primaryImage = item.product.images?.[0] || '/placeholder-product.jpg';

  // Calculate savings
  const savings = item.product.originalPrice
    ? (item.product.originalPrice - item.product.price) * item.quantity
    : 0;

  return (
    <div className={`flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${className}`}>
      {/* Product Image */}
      <div className={`flex-shrink-0 ${compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'}`}>
        <Link href={`/products/${item.product.slug}`}>
          <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={primaryImage}
              alt={item.product.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={compact ? '64px' : '96px'}
            />
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-2">
          {/* Product Title */}
          <Link
            href={`/products/${item.product.slug}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
          >
            {item.product.title}
          </Link>

          {/* Seller Info */}
          {showSellerInfo && item.product.seller && !compact && (
            <p className="text-xs text-gray-500">
              Sold by{' '}
              <Link
                href={`/sellers/${item.product.seller.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {item.product.seller.firstName} {item.product.seller.lastName}
              </Link>
            </p>
          )}

          {/* Category */}
          {item.product.category && !compact && (
            <Link
              href={`/categories/${item.product.category.id}`}
              className="text-xs text-gray-500 hover:text-blue-600"
            >
              {item.product.category.name}
            </Link>
          )}

          {/* Product Variant */}
          {item.productVariant && (
            <div className="text-xs text-gray-600">
              <span className="font-medium">{item.productVariant.name}:</span>{' '}
              {item.productVariant.value}
            </div>
          )}

          {/* Stock Status */}
          <div className="text-xs">
            {item.product.stock > 0 ? (
              <span className="text-green-600">In Stock ({item.product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Digital/Shipping Info */}
          {!compact && (
            <div className="text-xs text-gray-500">
              {item.product.isDigital ? (
                <span className="text-blue-600">Digital Product</span>
              ) : item.product.shippingRequired ? (
                <span>Physical Product • Shipping Required</span>
              ) : (
                <span>Available for Pickup</span>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(item.unitPrice)}
            </span>

            {/* Original Price */}
            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(item.product.originalPrice)}
              </span>
            )}

            {/* Savings Badge */}
            {savings > 0 && !compact && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* Total Price */}
          <div className="text-sm font-medium text-gray-900">
            Total: {formatPrice(item.totalPrice)}
          </div>
        </div>
      </div>

      {/* Quantity and Actions */}
      <div className="flex flex-col items-end justify-between space-y-3">
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => handleQuantityChange(currentQuantity - 1)}
            disabled={isLoading || isUpdating || currentQuantity <= 1}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="w-4 h-4" />
          </button>

          <div className="px-3 py-2 min-w-[3rem] text-center text-sm font-medium border-x border-gray-300">
            {isUpdating ? '...' : currentQuantity}
          </div>

          <button
            onClick={() => handleQuantityChange(currentQuantity + 1)}
            disabled={isLoading || isUpdating || currentQuantity >= item.product.stock}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Move to Wishlist */}
          {showWishlistButton && !compact && (
            <button
              onClick={handleMoveToWishlist}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              title="Move to wishlist"
            >
              <HeartIcon className="w-5 h-5" />
            </button>
          )}

          {/* Remove Item */}
          <button
            onClick={handleRemoveItem}
            disabled={isLoading || isUpdating}
            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
            title="Remove item"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isUpdating || isLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CartItem;