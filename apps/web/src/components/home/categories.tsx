import Link from 'next/link';
import { Laptop, Car, Home, Shirt, Book, Gamepad2 } from 'lucide-react';

const categories = [
  { name: 'Electronics', icon: Laptop, href: '/categories/electronics', color: 'bg-blue-500' },
  { name: 'Automotive', icon: Car, href: '/categories/automotive', color: 'bg-red-500' },
  { name: 'Home & Garden', icon: Home, href: '/categories/home-garden', color: 'bg-green-500' },
  { name: 'Fashion', icon: Shirt, href: '/categories/fashion', color: 'bg-purple-500' },
  { name: 'Books', icon: Book, href: '/categories/books', color: 'bg-orange-500' },
  { name: 'Gaming', icon: Gamepad2, href: '/categories/gaming', color: 'bg-indigo-500' },
];

export function Categories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`${category.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-center">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}