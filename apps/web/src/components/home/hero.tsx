import Link from 'next/link';
import { ArrowRight, ShoppingBag, Wallet, Truck } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Multi-Model
            <span className="text-blue-600"> Marketplace</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Buy and sell with confidence on our B2B/B2C/C2C platform. 
            Secure wallet transactions, flexible delivery options, and trusted community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
            >
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/register?role=seller"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center"
            >
              Become a Seller
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Wallet</h3>
            <p className="text-gray-600">
              Built-in wallet system for secure transactions. Add funds, make purchases, and withdraw earnings easily.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Delivery</h3>
            <p className="text-gray-600">
              Choose from pickup or delivery options. Sellers manage their own delivery partners for maximum flexibility.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-md">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Model</h3>
            <p className="text-gray-600">
              B2B, B2C, and C2C all in one platform. Whether you're a business or individual, we've got you covered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}