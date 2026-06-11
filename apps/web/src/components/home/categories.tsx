'use client';

import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import {
  Laptop,
  Car,
  Home,
  Shirt,
  Book,
  Gamepad2,
  Tag,
  Package,
  Smartphone,
  Monitor
} from 'lucide-react';

// GraphQL query for categories
const CATEGORIES_QUERY = gql`
  query CategoriesHome($limit: Int) {
    categories(pagination: { limit: $limit }) {
      edges {
        node {
          id
          name
          slug
          productCount
          imageUrl
        }
      }
    }
  }
`;

// Icon mapping for categories
const categoryIcons = {
  electronics: Laptop,
  automotive: Car,
  'home-garden': Home,
  fashion: Shirt,
  books: Book,
  gaming: Gamepad2,
  smartphones: Smartphone,
  computers: Monitor,
  default: Tag
};

// Color mapping for categories
const categoryColors = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-yellow-500'
];

// Mock data for development - replace with actual GraphQL data
const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', productCount: 1250, imageUrl: null },
  { id: '2', name: 'Fashion', slug: 'fashion', productCount: 890, imageUrl: null },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', productCount: 567, imageUrl: null },
  { id: '4', name: 'Automotive', slug: 'automotive', productCount: 423, imageUrl: null },
  { id: '5', name: 'Books & Media', slug: 'books', productCount: 312, imageUrl: null },
  { id: '6', name: 'Gaming', slug: 'gaming', productCount: 289, imageUrl: null }
];

export function Categories() {
  // GraphQL query for categories
  const { data, loading } = useQuery(CATEGORIES_QUERY, {
    variables: { limit: 6 },
    fetchPolicy: 'cache-first',
    errorPolicy: 'ignore',
  });

  // Use mock data if GraphQL data is not available
  const categories = data?.categories?.edges?.map((edge: any) => edge.node) || mockCategories;

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-gray-50 rounded-xl animate-pulse">
                <div className="bg-gray-300 w-16 h-16 rounded-full mb-4" />
                <div className="bg-gray-300 h-4 w-20 rounded" />
                <div className="bg-gray-300 h-3 w-12 rounded mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.slice(0, 6).map((category: any, index: number) => {
            // Get icon for category
            const iconKey = category.slug as keyof typeof categoryIcons;
            const Icon = categoryIcons[iconKey] || categoryIcons.default;

            // Get color for category
            const color = categoryColors[index % categoryColors.length];

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {category.imageUrl ? (
                  <div className="w-16 h-16 rounded-full mb-4 bg-gray-200 overflow-hidden group-hover:scale-110 transition-transform">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`${color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                )}

                <span className="font-medium text-gray-900 text-center mb-1">
                  {category.name}
                </span>

                {category.productCount && (
                  <span className="text-xs text-gray-500">
                    {category.productCount.toLocaleString()} items
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Package className="w-4 h-4" />
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}