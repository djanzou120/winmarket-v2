'use client';

import { ProductCard, type ProductCardProps } from './ProductCard';

interface ProductGridProps {
  products: ProductCardProps['product'][];
  loading?: boolean;
  layout?: 'grid' | 'list';
  columns?: 2 | 3 | 4 | 5;
  showQuickActions?: boolean;
  showSellerInfo?: boolean;
  showStats?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
}

export function ProductGrid({
  products,
  loading = false,
  layout = 'grid',
  columns = 4,
  showQuickActions = true,
  showSellerInfo = true,
  showStats = true,
  onAddToCart,
  onToggleFavorite,
  emptyStateMessage = "No products found",
  emptyStateAction
}: ProductGridProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className={layout === 'grid'
        ? `grid gap-6 ${getGridColumns(columns)}`
        : 'space-y-4'
      }>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} layout={layout} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {emptyStateMessage}
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          {emptyStateAction && (
            <div>
              {emptyStateAction}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Product grid/list
  return (
    <div className={layout === 'grid'
      ? `grid gap-6 ${getGridColumns(columns)}`
      : 'space-y-4'
    }>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          layout={layout}
          showQuickActions={showQuickActions}
          showSellerInfo={showSellerInfo}
          showStats={showStats}
          {...(onAddToCart ? { onAddToCart } : {})}
          {...(onToggleFavorite ? { onToggleFavorite } : {})}
        />
      ))}
    </div>
  );
}

// Helper function to get grid column classes
function getGridColumns(columns: number): string {
  switch (columns) {
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    case 5:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
    default:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }
}

// Loading skeleton component
function ProductSkeleton({ layout }: { layout: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="flex">
          {/* Image skeleton */}
          <div className="w-48 h-48 bg-gray-300 flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>

            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />

            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-4 bg-gray-300 rounded w-16" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-6 bg-gray-300 rounded w-20" />
                <div className="h-4 bg-gray-300 rounded w-16" />
              </div>
              <div className="h-10 bg-gray-300 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-300" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />

        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-20" />
          <div className="h-4 bg-gray-300 rounded w-16" />
        </div>

        <div className="h-4 bg-gray-300 rounded w-2/3" />

        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 rounded w-16" />
          <div className="h-6 bg-gray-300 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

// Export additional components and types
export { ProductSkeleton };
export type { ProductGridProps };