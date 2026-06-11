'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { ProductsDocument } from '@/graphql/generated';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal, Tag, TrendingUp } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { type ProductCardProps } from '@/components/products/ProductCard';
import { ProductFilters, type FilterValues, type FilterOption } from '@/components/products/ProductFilters';
import { SearchBar } from '@/components/products/SearchBar';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

// Mock data
interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  productCount: number;
  parent: { id: string; name: string; slug: string } | null;
  children: { id: string; name: string; slug: string; productCount: number }[];
}

const mockCategories: MockCategory[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets, computers, smartphones, and electronic devices from top brands.',
    imageUrl: '/category-electronics.jpg',
    isActive: true,
    productCount: 1250,
    parent: null,
    children: [
      { id: 'smartphones', name: 'Smartphones', slug: 'smartphones', productCount: 345 },
      { id: 'laptops', name: 'Laptops', slug: 'laptops', productCount: 234 },
      { id: 'tablets', name: 'Tablets', slug: 'tablets', productCount: 156 },
      { id: 'accessories', name: 'Accessories', slug: 'accessories', productCount: 515 }
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing, shoes, bags, and fashion accessories for all styles.',
    imageUrl: '/category-fashion.jpg',
    isActive: true,
    productCount: 890,
    parent: null,
    children: [
      { id: 'mens-clothing', name: "Men's Clothing", slug: 'mens-clothing', productCount: 234 },
      { id: 'womens-clothing', name: "Women's Clothing", slug: 'womens-clothing', productCount: 345 },
      { id: 'shoes', name: 'Shoes', slug: 'shoes', productCount: 198 },
      { id: 'accessories', name: 'Fashion Accessories', slug: 'fashion-accessories', productCount: 113 }
    ]
  }
];

const mockConditions: FilterOption[] = [
  { id: 'new', name: 'New', count: 456 },
  { id: 'like_new', name: 'Like New', count: 234 },
  { id: 'good', name: 'Good', count: 123 },
  { id: 'fair', name: 'Fair', count: 67 }
];

const mockProducts = Array.from({ length: 24 }, (_, index) => {
  const conditions = ['new', 'like_new', 'good'];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'];
  return {
    id: `product-${index + 1}`,
    title: `Category Product ${index + 1} - High Quality Item`,
    slug: `category-product-${index + 1}`,
    shortDescription: 'Premium quality product with excellent features and competitive pricing.',
    price: Math.floor(Math.random() * 1000) + 50,
    originalPrice: Math.random() > 0.7 ? Math.floor(Math.random() * 1200) + 100 : 0,
    condition: conditions[Math.floor(Math.random() * 3)] as string,
    images: ['/placeholder-product.jpg'],
    averageRating: Math.random() * 2 + 3,
    reviewCount: Math.floor(Math.random() * 100) + 1,
    soldCount: Math.floor(Math.random() * 50) + 1,
    viewCount: Math.floor(Math.random() * 500) + 10,
    favoriteCount: Math.floor(Math.random() * 25) + 1,
    isDigital: Math.random() > 0.8,
    shippingRequired: Math.random() > 0.2,
    seller: {
      id: `seller-${index % 5 + 1}`,
      firstName: firstNames[index % 5] as string,
      lastName: lastNames[index % 5] as string,
    },
    category: {
      id: 'electronics',
      name: 'Electronics',
      slug: 'electronics',
    },
  };
}) as ProductCardProps['product'][];

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.slug as string;

  // State
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    priceRange: {
      min: parseInt(searchParams.get('min_price') || '0'),
      max: parseInt(searchParams.get('max_price') || '10000')
    },
    sortBy: searchParams.get('sort') || 'newest'
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Find the current category from mock data
  const currentCategory = mockCategories.find(cat => cat.slug === categorySlug) ?? mockCategories[0]!;

  const categoryLoading = false; // Using mock data for now (no categoryBySlug query available)

  const { loading: productsLoading } = useQuery(ProductsDocument, {
      variables: {
        categoryId: currentCategory.id,
        filter: {
          search: searchQuery,
          condition: filters.condition,
          priceRange: filters.priceRange,
          rating: filters.rating,
          isDigital: filters.isDigital,
          shippingRequired: filters.shippingRequired
        },
        pagination: {
          offset: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage
        }
      },
      skip: false
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
    router.replace(`/categories/${categorySlug}${newUrl}`, { scroll: false });
  }, [searchQuery, filters, currentPage, router, categorySlug]);

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

  if (categoryLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3" />
            <div className="h-48 bg-gray-300 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          {currentCategory.parent && (
            <>
              <span>/</span>
              <Link href={`/categories/${currentCategory.parent.slug}`} className="hover:text-gray-900">
                {currentCategory.parent.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{currentCategory.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          {currentCategory.imageUrl && (
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl overflow-hidden mb-6">
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-8">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {currentCategory.name}
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                    {currentCategory.description}
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {currentCategory.productCount.toLocaleString()} products
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Popular category
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subcategories */}
          {(currentCategory.children?.length ?? 0) > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentCategory.children.map((subCategory) => (
                  <Link
                    key={subCategory.id}
                    href={`/categories/${subCategory.slug}`}
                    className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {subCategory.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {subCategory.productCount} items
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder={`Search in ${currentCategory.name}...`}
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <ProductFilters
              categories={[]} // Don't show category filters on category page
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery
                    ? `Search results in ${currentCategory.name}`
                    : `${currentCategory.name} Products`
                  }
                </h2>
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
              columns={3}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              emptyStateMessage={
                searchQuery
                  ? `No products found for "${searchQuery}" in ${currentCategory.name}`
                  : `No products found in ${currentCategory.name}`
              }
              emptyStateAction={
                <div className="space-y-3">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-3"
                    >
                      Clear search
                    </button>
                  )}
                  <button
                    onClick={handleClearFilters}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Clear filters
                  </button>
                </div>
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