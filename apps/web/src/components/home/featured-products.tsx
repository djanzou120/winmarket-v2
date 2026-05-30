'use client';

import { Star, MapPin } from 'lucide-react';

// Mock data - will be replaced with GraphQL query
const mockProducts = [
  {
    id: '1',
    title: 'MacBook Pro 14-inch',
    price: 1999,
    images: ['/placeholder-laptop.jpg'],
    rating: 4.8,
    reviewCount: 124,
    seller: 'TechStore Pro',
    location: 'San Francisco, CA',
    deliveryOptions: ['Pickup', 'Delivery']
  },
  {
    id: '2', 
    title: 'Vintage Leather Jacket',
    price: 249,
    images: ['/placeholder-jacket.jpg'],
    rating: 4.6,
    reviewCount: 89,
    seller: 'Fashion Forward',
    location: 'New York, NY',
    deliveryOptions: ['Pickup', 'Delivery']
  },
  {
    id: '3',
    title: 'Professional Camera Kit',
    price: 1299,
    images: ['/placeholder-camera.jpg'],
    rating: 4.9,
    reviewCount: 67,
    seller: 'PhotoGear Plus',
    location: 'Los Angeles, CA',
    deliveryOptions: ['Pickup']
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    price: 399,
    images: ['/placeholder-chair.jpg'],
    rating: 4.5,
    reviewCount: 156,
    seller: 'Office Solutions',
    location: 'Chicago, IL',
    deliveryOptions: ['Delivery']
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover the best deals from our trusted sellers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-square bg-gray-200 relative">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Product Image</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{product.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    {product.deliveryOptions.includes('Pickup') && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Pickup
                      </span>
                    )}
                    {product.deliveryOptions.includes('Delivery') && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Delivery
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}