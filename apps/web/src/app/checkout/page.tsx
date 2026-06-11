'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/stores/cart-store';
import { useCartOperations } from '@/hooks/use-cart-operations';
import CheckoutSteps, { CheckoutStep } from '@/components/checkout/CheckoutSteps';
import CartSummary from '@/components/cart/CartSummary';
import { CreateOrderDocument, PaymentMethod } from '@/graphql/generated';
import toast from 'react-hot-toast';

// Types for checkout state
interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Regular shipping with tracking',
    price: 5.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Priority shipping with faster handling',
    price: 12.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Next business day delivery',
    price: 24.99,
    estimatedDays: '1 business day',
  },
];

const PAYMENT_METHODS = [
  {
    id: PaymentMethod.Wallet,
    name: 'WinMarket Wallet',
    description: 'Pay with your WinMarket wallet balance',
    icon: '💰',
  },
  {
    id: PaymentMethod.Card,
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
  },
  {
    id: PaymentMethod.MobileMoney,
    name: 'Mobile Money',
    description: 'MTN, Orange, Airtel Money',
    icon: '📱',
  },
  {
    id: PaymentMethod.CashOnDelivery,
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '🏦',
  },
];

const checkoutSteps: CheckoutStep[] = [
  {
    id: 'address',
    name: 'Address',
    description: 'Shipping details',
    status: 'current',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Shipping method',
    status: 'upcoming',
  },
  {
    id: 'payment',
    name: 'Payment',
    description: 'Payment method',
    status: 'upcoming',
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Final check',
    status: 'upcoming',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isEmpty, hasItems, subtotal } = useCart();
  const { reloadCart } = useCartOperations();

  const [currentStep, setCurrentStep] = useState('address');
  const [isLoading, setIsLoading] = useState(false);

  // Checkout state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]!);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.Wallet);
  const [orderNotes, setOrderNotes] = useState('');

  const [createOrder] = useMutation(CreateOrderDocument);

  // Redirect if cart is empty
  useEffect(() => {
    if (isEmpty && !isLoading) {
      router.push('/cart');
    }
  }, [isEmpty, isLoading, router]);

  // Load cart data
  useEffect(() => {
    setIsLoading(true);
    reloadCart().finally(() => setIsLoading(false));
  }, []);

  // Handle step navigation
  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
  };

  // Handle order completion
  const handleCompleteOrder = async () => {
    setIsLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        productVariantId: item.productVariantId || undefined,
        quantity: item.quantity,
      }));

      const { data } = await createOrder({
        variables: {
          input: {
            items: orderItems,
            shippingAddress: {
              name: shippingAddress.name,
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phone: shippingAddress.phone,
            },
            paymentMethod: selectedPayment,
            shippingMethod: selectedDelivery.id,
            notes: orderNotes || undefined,
          },
        },
      });

      if (data?.createOrder) {
        const order = data.createOrder;
        toast.success('Order placed successfully!');
        router.push(`/checkout/success?order=${order.orderNumber}&total=${order.totalAmount}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEmpty) {
    return <CheckoutPageSkeleton />;
  }

  if (!hasItems) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <LockClosedIcon className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Steps */}
      <CheckoutSteps
        steps={checkoutSteps}
        currentStep={currentStep}
        onStepClick={handleStepChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {currentStep === 'address' && (
                <AddressStep
                  address={shippingAddress}
                  onChange={setShippingAddress}
                  onNext={() => setCurrentStep('delivery')}
                />
              )}
              {currentStep === 'delivery' && (
                <DeliveryStep
                  options={DELIVERY_OPTIONS}
                  selected={selectedDelivery}
                  onSelect={setSelectedDelivery}
                  onNext={() => setCurrentStep('payment')}
                  onBack={() => setCurrentStep('address')}
                />
              )}
              {currentStep === 'payment' && (
                <PaymentStep
                  methods={PAYMENT_METHODS}
                  selected={selectedPayment}
                  onSelect={setSelectedPayment}
                  onNext={() => setCurrentStep('review')}
                  onBack={() => setCurrentStep('delivery')}
                />
              )}
              {currentStep === 'review' && (
                <ReviewStep
                  address={shippingAddress}
                  delivery={selectedDelivery}
                  paymentMethod={selectedPayment}
                  items={items}
                  subtotal={subtotal}
                  notes={orderNotes}
                  onNotesChange={setOrderNotes}
                  onComplete={handleCompleteOrder}
                  onBack={() => setCurrentStep('payment')}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-6">
              <CartSummary
                showCheckoutButton={false}
                showShippingCalculator={false}
                showCouponCode={true}
              />

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-blue-900">Secure Payment</h4>
                    <p className="text-blue-700 mt-1">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Address Step ============
const AddressStep: React.FC<{
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
  onNext: () => void;
}> = ({ address, onChange, onNext }) => {
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const updateField = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...address, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.name.trim()) newErrors.name = 'Full name is required';
    if (!address.street.trim()) newErrors.street = 'Street address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.country.trim()) newErrors.country = 'Country is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full name *
        </label>
        <input
          type="text"
          id="name"
          value={address.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="John Doe"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">
          Street address *
        </label>
        <input
          type="text"
          id="street"
          value={address.street}
          onChange={(e) => updateField('street', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.street ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="123 Main Street"
        />
        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            type="text"
            id="city"
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Douala"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State / Province
          </label>
          <input
            type="text"
            id="state"
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Littoral"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal / ZIP code
          </label>
          <input
            type="text"
            id="postalCode"
            value={address.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="00000"
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <input
            type="text"
            id="country"
            value={address.country}
            onChange={(e) => updateField('country', e.target.value)}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Cameroon"
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone number *
        </label>
        <input
          type="tel"
          id="phone"
          value={address.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
          placeholder="+237 6XX XXX XXX"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Delivery
        </button>
      </div>
    </div>
  );
};

// ============ Delivery Step ============
const DeliveryStep: React.FC<{
  options: DeliveryOption[];
  selected: DeliveryOption;
  onSelect: (option: DeliveryOption) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ options, selected, onSelect, onNext, onBack }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Delivery Options</h3>
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
            selected.id === option.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="delivery"
            checked={selected.id === option.id}
            onChange={() => onSelect(option)}
            className="mt-1 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option.name}</span>
              <span className="font-semibold text-gray-900">${option.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            <p className="text-sm text-gray-500 mt-1">Estimated: {option.estimatedDays}</p>
          </div>
        </label>
      ))}
    </div>
    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        Back to Address
      </button>
      <button
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Continue to Payment
      </button>
    </div>
  </div>
);

// ============ Payment Step ============
const PaymentStep: React.FC<{
  methods: typeof PAYMENT_METHODS;
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ methods, selected, onSelect, onNext, onBack }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
    <div className="space-y-3">
      {methods.map((method) => (
        <label
          key={method.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
            selected === method.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            checked={selected === method.id}
            onChange={() => onSelect(method.id)}
            className="text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3 flex items-center gap-3">
            <span className="text-2xl">{method.icon}</span>
            <div>
              <span className="font-medium text-gray-900">{method.name}</span>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </div>
        </label>
      ))}
    </div>
    <div className="flex justify-between">
      <button
        onClick={onBack}
        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        Back to Delivery
      </button>
      <button
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Review Order
      </button>
    </div>
  </div>
);

// ============ Review Step ============
const ReviewStep: React.FC<{
  address: ShippingAddress;
  delivery: DeliveryOption;
  paymentMethod: PaymentMethod;
  items: any[];
  subtotal: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}> = ({ address, delivery, paymentMethod, items, subtotal, notes, onNotesChange, onComplete, onBack, isLoading }) => {
  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name || paymentMethod;
  const shippingCost = delivery.price;
  const total = subtotal + shippingCost;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review Your Order</h3>

      {/* Shipping Address */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h4>
        <p className="text-sm text-gray-600">{address.name}</p>
        <p className="text-sm text-gray-600">{address.street}</p>
        <p className="text-sm text-gray-600">
          {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
        <p className="text-sm text-gray-600">{address.phone}</p>
      </div>

      {/* Delivery Method */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery Method</h4>
        <p className="text-sm text-gray-900">{delivery.name} - ${delivery.price.toFixed(2)}</p>
        <p className="text-sm text-gray-600">{delivery.estimatedDays}</p>
      </div>

      {/* Payment Method */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Method</h4>
        <p className="text-sm text-gray-900">{paymentLabel}</p>
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Items ({items.length})</h4>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span className="text-gray-900">{item.product?.title || 'Product'}</span>
                <span className="text-gray-500 ml-1">x{item.quantity}</span>
              </div>
              <span className="font-medium text-gray-900">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Order Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Any special instructions for your order..."
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back to Payment
        </button>
        <button
          onClick={onComplete}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          )}
          <span>{isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}</span>
        </button>
      </div>
    </div>
  );
};

// Checkout Page Skeleton
const CheckoutPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
