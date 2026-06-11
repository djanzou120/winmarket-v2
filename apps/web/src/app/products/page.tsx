'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useQuery } from '@apollo/client';
import { ProductsDocument } from '@/graphql/generated';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { ProductCardProps } from '@/components/products/ProductCard';
import { ProductFilters, type FilterValues, type FilterOption } from '@/components/products/ProductFilters';
import { SearchBar } from '@/components/products/SearchBar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

// Mock data for development
const mockCategories: FilterOption[] = [
  { id: '1', name: 'Electronics', count: 1250 },
  { id: '2', name: 'Fashion', count: 890 },
  { id: '3', name: 'Home & Garden', count: 567 },
  { id: '4', name: 'Sports & Outdoors', count: 423 },
  { id: '5', name: 'Books & Media', count: 312 },
  { id: '6', name: 'Automotive', count: 189 }
];

const mockConditions: FilterOption[] = [
  { id: 'new', name: 'New', count: 2145 },
  { id: 'like_new', name: 'Like New', count: 987 },
  { id: 'good', name: 'Good', count: 756 },
  { id: 'fair', name: 'Fair', count: 234 }
];

const mockProducts: ProductCardProps['product'][] = Array.from({ length: 20 }, (_, index) => ({
  id: `product-${index + 1}`,
  title: `Product ${index + 1} - Sample Item with Long Title`,
  slug: `product-${index + 1}`,
  shortDescription: 'High-quality product with excellent features and competitive pricing.',
  price: Math.floor(Math.random() * 1000) + 50,
  ...(Math.random() > 0.7 ? { originalPrice: Math.floor(Math.random() * 1200) + 100 } : {}),
  condition: ['new', 'like_new', 'good'][Math.floor(Math.random() * 3)]!,
  images: ['/placeholder-product.jpg'],
  averageRating: Math.random() * 2 + 3, // 3-5 rating
  reviewCount: Math.floor(Math.random() * 100) + 1,
  soldCount: Math.floor(Math.random() * 50) + 1,
  viewCount: Math.floor(Math.random() * 500) + 10,
  favoriteCount: Math.floor(Math.random() * 25) + 1,
  isDigital: Math.random() > 0.8,
  shippingRequired: Math.random() > 0.2,
  seller: {
    id: `seller-${index % 5 + 1}`,
    firstName: ['John', 'Jane', 'Mike', 'Sarah', 'David'][index % 5]!,
    lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][index % 5]!,
  },
  category: {
    id: mockCategories[index % mockCategories.length]!.id,
    name: mockCategories[index % mockCategories.length]!.name,
    slug: mockCategories[index % mockCategories.length]!.name.toLowerCase().replace(/\s+/g, '-')
  }
}));

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" /></div>}>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(() => {
    const initial: FilterValues = {
      priceRange: {
        min: parseInt(searchParams.get('min_price') || '0'),
        max: parseInt(searchParams.get('max_price') || '10000')
      },
      sortBy: searchParams.get('sort') || 'newest'
    };
    const category = searchParams.get('category');
    if (category) {
      initial.categories = [category];
    }
    return initial;
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // GraphQL query for products
  const { loading: productsLoading } = useQuery(ProductsDocument, {
      variables: {
        filter: {
          search: searchQuery,
          categories: filters.categories,
          priceRange: filters.priceRange,
          condition: filters.condition,
          rating: filters.rating,
          isDigital: filters.isDigital,
          shippingRequired: filters.shippingRequired
        },
        pagination: {
          offset: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage
        }
      },
      skip: false // Would normally be actual GraphQL
    }
  );

  // Filtered and sorted products (mock implementation)
  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories?.length) {
      filtered = filtered.filter(product =>
        product.category && filters.categories!.includes(product.category.id)
      );
    }

    // Condition filter
    if (filters.condition?.length) {
      filtered = filtered.filter(product =>
        filters.condition!.includes(product.condition!)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange!.min &&
        product.price <= filters.priceRange!.max
      );
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(product =>
        (product.averageRating ?? 0) >= filters.rating!
      );
    }

    // Digital/Physical filter
    if (filters.isDigital !== null && filters.isDigital !== undefined) {
      filtered = filtered.filter(product =>
        product.isDigital === filters.isDigital
      );
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'sold':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      case 'oldest':
        filtered.reverse();
        break;
      default: // newest
        break;
    }

    return filtered;
  }, [searchQuery, filters, mockProducts]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    if (filters.categories?.length) {
      filters.categories.forEach(cat => params.append('category', cat));
    }
    if (filters.condition?.length) {
      filters.condition.forEach(cond => params.append('condition', cond));
    }
    if (filters.priceRange?.min && filters.priceRange.min > 0) {
      params.set('min_price', filters.priceRange.min.toString());
    }
    if (filters.priceRange?.max && filters.priceRange.max < 10000) {
      params.set('max_price', filters.priceRange.max.toString());
    }
    if (filters.sortBy && filters.sortBy !== 'newest') {
      params.set('sort', filters.sortBy);
    }
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/products${newUrl}`, { scroll: false });
  }, [searchQuery, filters, currentPage, router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 10000 },
      sortBy: 'newest'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddToCart = (_productId: string) => {
    // Cart functionality handled via product detail page
  };

  const handleToggleFavorite = (_productId: string) => {
    // Favorites functionality to be implemented
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Filters and Results Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <ProductFilters
              categories={mockCategories}
              conditions={mockConditions}
              priceRange={{ min: 0, max: 10000 }}
              values={filters}
              onChange={handleFiltersChange}
              onClear={handleClearFilters}
              totalResults={filteredProducts.length}
              showMobileToggle={true}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length.toLocaleString()} products found
                </p>
              </div>

              {/* View Options */}
              <div className="flex items-center gap-4">
                {/* Layout Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setLayout('grid')}
                    className={`p-2 rounded ${layout === 'grid'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayout('list')}
                    className={`p-2 rounded ${layout === 'list'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filters Toggle */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={paginatedProducts}
              loading={productsLoading}
              layout={layout}
              {...(layout === 'grid' ? { columns: 3 as const } : {})}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              emptyStateMessage={
                searchQuery
                  ? `No products found for "${searchQuery}"`
                  : "No products found"
              }
              emptyStateAction={
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              }
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      {totalPages > 6 && <span className="px-2 text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </main>
  );
}