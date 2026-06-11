'use client';

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/stores/cart-store';
import { useCartOperations } from '@/hooks/use-cart-operations';
import type { CartItem as CartItemType } from '@/graphql/generated';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniCart: React.FC<MiniCartProps> = ({ isOpen, onClose }) => {
  const {
    items,
    subtotal,
    currency,
    isEmpty,
    formattedSubtotal,
  } = useCart();

  const { removeItem } = useCartOperations();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Calculate estimated tax (placeholder)
  const estimatedTax = subtotal * 0.1; // 10% tax rate for demo
  const estimatedTotal = subtotal + estimatedTax;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b border-gray-200">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Shopping Cart
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={onClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      {isEmpty ? (
                        <EmptyCartContent onClose={onClose} />
                      ) : (
                        <div className="space-y-6">
                          {/* Items List */}
                          <div className="flow-root">
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {items.map((item) => (
                                <li key={item.id} className="py-6">
                                  <MiniCartItem
                                    item={item}
                                    onRemove={handleRemoveItem}
                                    isRemoving={removingItemId === item.id}
                                    formatPrice={formatPrice}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Cart Summary */}
                          <div className="space-y-4 border-t border-gray-200 pt-6">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <p>Subtotal</p>
                              <p>{formattedSubtotal}</p>
                            </div>

                            <div className="flex justify-between text-sm text-gray-500">
                              <p>Estimated tax</p>
                              <p>{formatPrice(estimatedTax)}</p>
                            </div>

                            <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-4">
                              <p>Total</p>
                              <p>{formatPrice(estimatedTotal)}</p>
                            </div>

                            <p className="mt-0.5 text-sm text-gray-500">
                              Shipping and taxes calculated at checkout.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {!isEmpty && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="space-y-3">
                          <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                          >
                            Checkout
                          </Link>
                          <Link
                            href="/cart"
                            onClick={onClose}
                            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                          >
                            View Cart
                          </Link>
                        </div>

                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-blue-600 hover:text-blue-500"
                              onClick={onClose}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Mini Cart Item Component
interface MiniCartItemProps {
  item: CartItemType;
  onRemove: (itemId: string) => void;
  isRemoving: boolean;
  formatPrice: (price: number) => string;
}

const MiniCartItem: React.FC<MiniCartItemProps> = ({ item, onRemove, isRemoving, formatPrice }) => {
  const primaryImage = item.product.images?.[0] || '/placeholder-product.jpg';

  return (
    <div className="flex">
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={primaryImage}
          alt={item.product.title}
          width={80}
          height={80}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link
                href={`/products/${item.product.slug}`}
                className="hover:text-blue-600 line-clamp-2"
              >
                {item.product.title}
              </Link>
            </h3>
            <p className="ml-4">{formatPrice(item.totalPrice)}</p>
          </div>

          {/* Product Variant */}
          {item.productVariant && (
            <p className="mt-1 text-sm text-gray-500">
              {item.productVariant.name}: {item.productVariant.value}
            </p>
          )}

          {/* Unit Price */}
          <p className="mt-1 text-sm text-gray-500">
            {formatPrice(item.unitPrice)} each
          </p>
        </div>

        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-gray-500">Qty {item.quantity}</p>

          <div className="flex">
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={isRemoving}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty Cart Content
interface EmptyCartContentProps {
  onClose: () => void;
}

const EmptyCartContent: React.FC<EmptyCartContentProps> = ({ onClose }) => (
  <div className="text-center">
    <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300" />
    <h3 className="mt-6 text-sm font-medium text-gray-900">Your cart is empty</h3>
    <p className="mt-2 text-sm text-gray-500">
      Start adding some items to your cart to see them here.
    </p>
    <div className="mt-6">
      <Link
        href="/products"
        onClick={onClose}
        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  </div>
);

// Cart Trigger Button Component for Navbar
interface CartTriggerProps {
  onClick: () => void;
  className?: string;
}

export const CartTrigger: React.FC<CartTriggerProps> = ({ onClick, className = '' }) => {
  const { itemCount, isLoading } = useCart();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 text-gray-400 hover:text-gray-500 ${className}`}
      aria-label={`Open cart (${itemCount} items)`}
    >
      <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      {isLoading && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 animate-pulse"></span>
      )}
    </button>
  );
};

export default MiniCart;