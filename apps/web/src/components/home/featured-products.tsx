'use client';

import { useQuery } from '@apollo/client';
import { FeaturedProductsDocument } from '@/graphql/generated';
import { ProductGrid } from '@/components/products/ProductGrid';
import Link from 'next/link';

// Mock data for development
const mockProducts = [
  {
    id: '1',
    title: 'MacBook Pro 14-inch M3 Max',
    slug: 'macbook-pro-14-inch-m3-max',
    shortDescription: 'Professional laptop with M3 Max chip for demanding creative workflows.',
    price: 1999,
    originalPrice: 2199,
    images: ['/placeholder-laptop.jpg'],
    averageRating: 4.8,
    reviewCount: 124,
    isDigital: false,
    shippingRequired: true,
    seller: {
      id: 'seller-1',
      firstName: 'TechStore',
      lastName: 'Pro'
    },
    category: {
      id: 'electronics',
      name: 'Electronics',
      slug: 'electronics'
    }
  },
  {
    id: '2',
    title: 'Premium Leather Jacket',
    slug: 'premium-leather-jacket',
    shortDescription: 'Vintage-style leather jacket crafted from high-quality materials.',
    price: 249,
    originalPrice: null,
    images: ['/placeholder-jacket.jpg'],
    averageRating: 4.6,
    reviewCount: 89,
    isDigital: false,
    shippingRequired: true,
    seller: {
      id: 'seller-2',
      firstName: 'Fashion',
      lastName: 'Forward'
    },
    category: {
      id: 'fashion',
      name: 'Fashion',
      slug: 'fashion'
    }
  },
  {
    id: '3',
    title: 'Professional Camera Kit',
    slug: 'professional-camera-kit',
    shortDescription: 'Complete camera setup for professional photography and videography.',
    price: 1299,
    originalPrice: 1499,
    images: ['/placeholder-camera.jpg'],
    averageRating: 4.9,
    reviewCount: 67,
    isDigital: false,
    shippingRequired: true,
    seller: {
      id: 'seller-3',
      firstName: 'PhotoGear',
      lastName: 'Plus'
    },
    category: {
      id: 'electronics',
      name: 'Electronics',
      slug: 'electronics'
    }
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    shortDescription: 'Comfortable office chair with full lumbar support for long work sessions.',
    price: 399,
    originalPrice: null,
    images: ['/placeholder-chair.jpg'],
    averageRating: 4.5,
    reviewCount: 156,
    isDigital: false,
    shippingRequired: true,
    seller: {
      id: 'seller-4',
      firstName: 'Office',
      lastName: 'Solutions'
    },
    category: {
      id: 'furniture',
      name: 'Furniture',
      slug: 'furniture'
    }
  },
];

export function FeaturedProducts() {
  // GraphQL query for featured products
  const { data, loading, error } = useQuery(FeaturedProductsDocument, {
    variables: { limit: 8 },
    fetchPolicy: 'cache-first',
    errorPolicy: 'ignore'
  });

  // Use mock data if GraphQL data is not available
  const products = data?.featuredProducts || mockProducts;

  const handleAddToCart = (_productId: string) => {
    // Cart functionality handled via product detail page
  };

  const handleToggleFavorite = (_productId: string) => {
    // Favorites functionality to be implemented
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Discover the best deals from our trusted sellers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-300" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-4 bg-gray-300 rounded w-full" />
                  <div className="h-8 bg-gray-300 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !products?.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Discover the best deals from our trusted sellers</p>
          </div>

          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Unable to load featured products</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600">Discover the best deals from our trusted sellers</p>
        </div>

        <ProductGrid
          products={products.slice(0, 8)}
          loading={false}
          layout="grid"
          columns={4}
          showQuickActions={true}
          showSellerInfo={false}
          showStats={true}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
        />

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}