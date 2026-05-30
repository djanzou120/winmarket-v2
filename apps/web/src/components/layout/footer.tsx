import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WinMarket</h3>
            <p className="text-gray-300">
              Your trusted marketplace for buying and selling products with secure wallet transactions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/products" className="hover:text-white">Browse Products</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/orders" className="hover:text-white">My Orders</Link></li>
              <li><Link href="/wallet" className="hover:text-white">Wallet</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/seller/dashboard" className="hover:text-white">Seller Dashboard</Link></li>
              <li><Link href="/seller/products" className="hover:text-white">My Products</Link></li>
              <li><Link href="/seller/orders" className="hover:text-white">Sales</Link></li>
              <li><Link href="/seller/delivery" className="hover:text-white">Delivery Partners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 WinMarket V2. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}