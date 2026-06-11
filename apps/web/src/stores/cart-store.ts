import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CartItem as GeneratedCartItem,
  AddToCartInput as GeneratedAddToCartInput,
} from '@/graphql/generated';

// Use the generated types
export type CartItem = GeneratedCartItem;
export type AddToCartInput = GeneratedAddToCartInput;

export interface CartStoreState {
  // Cart state
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  currency: string;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;

  // Cart actions - these will be called from components with Apollo mutations
  setItems: (items: CartItem[]) => void;
  addItemOptimistic: (item: CartItem) => void;
  removeItemOptimistic: (itemId: string) => void;
  updateQuantityOptimistic: (itemId: string, quantity: number) => void;
  clearCartOptimistic: () => void;

  // Local state management
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Cart calculations
  calculateTotals: () => void;
  getItemById: (itemId: string) => CartItem | undefined;
  isItemInCart: (productId: string, productVariantId?: string) => boolean;
  getItemQuantity: (productId: string, productVariantId?: string) => number;

  // Coupon management
  couponCode: string | null;
  discount: number;
  setCoupon: (code: string | null, discount?: number) => void;

  // Utilities
  getTotalWithTax: (taxRate?: number) => number;
  getShippingTotal: (shippingCost?: number) => number;
  getFinalTotal: (taxRate?: number, shippingCost?: number, discount?: number) => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      itemCount: 0,
      currency: 'USD',
      updatedAt: null,
      isLoading: false,
      error: null,
      couponCode: null,
      discount: 0,

      // Set items from server response
      setItems: (items: CartItem[]) => {
        set({ items, updatedAt: new Date().toISOString() });
        get().calculateTotals();
      },

      // Optimistic updates for better UX
      addItemOptimistic: (item: CartItem) => {
        const currentItems = get().items;

        // Check if item already exists
        const existingItemIndex = currentItems.findIndex(
          existingItem =>
            existingItem.productId === item.productId &&
            existingItem.productVariantId === item.productVariantId
        );

        let updatedItems: CartItem[];
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems = currentItems.map((existingItem, index) =>
            index === existingItemIndex
              ? {
                  ...existingItem,
                  quantity: existingItem.quantity + item.quantity,
                  totalPrice: (existingItem.quantity + item.quantity) * existingItem.unitPrice,
                  updatedAt: new Date().toISOString()
                }
              : existingItem
          );
        } else {
          // Add new item
          updatedItems = [...currentItems, item];
        }

        set({ items: updatedItems, updatedAt: new Date().toISOString() });
        get().calculateTotals();
      },

      removeItemOptimistic: (itemId: string) => {
        const updatedItems = get().items.filter(item => item.id !== itemId);
        set({ items: updatedItems, updatedAt: new Date().toISOString() });
        get().calculateTotals();
      },

      updateQuantityOptimistic: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          return get().removeItemOptimistic(itemId);
        }

        const updatedItems = get().items.map(item =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                totalPrice: item.unitPrice * quantity,
                updatedAt: new Date().toISOString()
              }
            : item
        );

        set({ items: updatedItems, updatedAt: new Date().toISOString() });
        get().calculateTotals();
      },

      clearCartOptimistic: () => {
        set({
          items: [],
          subtotal: 0,
          itemCount: 0,
          couponCode: null,
          discount: 0,
          updatedAt: new Date().toISOString()
        });
      },

      // State management
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Cart calculations
      calculateTotals: () => {
        const { items } = get();
        const subtotal = items.reduce((total, item) => total + item.totalPrice, 0);
        const itemCount = items.reduce((count, item) => count + item.quantity, 0);

        set({
          subtotal,
          itemCount,
          updatedAt: new Date().toISOString()
        });
      },

      // Cart utilities
      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },

      isItemInCart: (productId: string, productVariantId?: string) => {
        return get().items.some(item =>
          item.productId === productId &&
          item.productVariantId === productVariantId
        );
      },

      getItemQuantity: (productId: string, productVariantId?: string) => {
        const item = get().items.find(item =>
          item.productId === productId &&
          item.productVariantId === productVariantId
        );
        return item?.quantity || 0;
      },

      // Coupon management
      setCoupon: (code: string | null, discount = 0) => {
        set({ couponCode: code, discount });
      },

      // Financial calculations
      getTotalWithTax: (taxRate = 0) => {
        const { subtotal, discount } = get();
        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        return subtotalAfterDiscount + (subtotalAfterDiscount * taxRate);
      },

      getShippingTotal: (shippingCost = 0) => {
        return shippingCost;
      },

      getFinalTotal: (taxRate = 0, shippingCost = 0, appliedDiscount?: number) => {
        const { subtotal, discount } = get();
        const finalDiscount = appliedDiscount !== undefined ? appliedDiscount : discount;
        const subtotalAfterDiscount = Math.max(0, subtotal - finalDiscount);
        const tax = subtotalAfterDiscount * taxRate;
        return subtotalAfterDiscount + tax + shippingCost;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
        currency: state.currency,
        updatedAt: state.updatedAt,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate totals after hydration
          state.calculateTotals();
        }
      },
    }
  )
);

// Hook for easy cart access with computed values
export const useCart = () => {
  const cart = useCartStore();

  return {
    // State
    items: cart.items,
    subtotal: cart.subtotal,
    itemCount: cart.itemCount,
    currency: cart.currency,
    isLoading: cart.isLoading,
    error: cart.error,
    couponCode: cart.couponCode,
    discount: cart.discount,

    // Actions
    setItems: cart.setItems,
    addItemOptimistic: cart.addItemOptimistic,
    removeItemOptimistic: cart.removeItemOptimistic,
    updateQuantityOptimistic: cart.updateQuantityOptimistic,
    clearCartOptimistic: cart.clearCartOptimistic,
    setError: cart.setError,
    setLoading: cart.setLoading,
    setCoupon: cart.setCoupon,

    // Utilities
    getItemById: cart.getItemById,
    isItemInCart: cart.isItemInCart,
    getItemQuantity: cart.getItemQuantity,
    calculateTotals: cart.calculateTotals,

    // Computed values
    isEmpty: cart.items.length === 0,
    hasItems: cart.items.length > 0,
    totalItems: cart.itemCount,

    // Formatted values
    formattedSubtotal: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency,
    }).format(cart.subtotal),

    formattedDiscount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency,
    }).format(cart.discount),

    // Financial calculations
    getTotalWithTax: cart.getTotalWithTax,
    getShippingTotal: cart.getShippingTotal,
    getFinalTotal: cart.getFinalTotal,

    // Formatted financial calculations
    getFormattedTotalWithTax: (taxRate = 0) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency,
    }).format(cart.getTotalWithTax(taxRate)),

    getFormattedFinalTotal: (taxRate = 0, shippingCost = 0, discount?: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cart.currency,
    }).format(cart.getFinalTotal(taxRate, shippingCost, discount)),
  };
};

// Export the store for advanced usage
export default useCartStore;