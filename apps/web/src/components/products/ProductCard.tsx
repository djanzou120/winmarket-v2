'use client';

import { useState } from 'react';
import { Star, Heart, Eye, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug?: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    images: string[];
    condition?: string;
    averageRating?: number;
    reviewCount?: number;
    soldCount?: number;
    viewCount?: number;
    favoriteCount?: number;
    isDigital?: boolean;
    shippingRequired?: boolean;
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  showQuickActions?: boolean;
  showSellerInfo?: boolean;
  showStats?: boolean;
  layout?: 'grid' | 'list';
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
}

export function ProductCard({
  product,
  showQuickActions = true,
  showSellerInfo = true,
  showStats = true,
  layout = 'grid',
  onAddToCart,
  onToggleFavorite
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const productUrl = `/products/${product.slug || product.id}`;
  const sellerName = `${product.seller.firstName} ${product.seller.lastName}`;
  const mainImage = product.images?.[0] || '/placeholder-product.jpg';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
    // Announce to screen readers
    if (typeof window !== 'undefined') {
      const announcement = `Added ${product.title} to cart`;
      const announceEl = document.getElementById('announcements');
      if (announceEl) {
        announceEl.textContent = announcement;
        setTimeout(() => {
          announceEl.textContent = '';
        }, 1000);
      }
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onToggleFavorite?.(product.id);
    // Announce to screen readers
    if (typeof window !== 'undefined') {
      const announcement = isFavorited
        ? `Removed ${product.title} from favorites`
        : `Added ${product.title} to favorites`;
      const announceEl = document.getElementById('announcements');
      if (announceEl) {
        announceEl.textContent = announcement;
        setTimeout(() => {
          announceEl.textContent = '';
        }, 1000);
      }
    }
  };

  if (layout === 'list') {
    return (
      <Link href={productUrl} className="block">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
          <div className="flex">
            {/* Image Section */}
            <div className="w-48 h-48 relative flex-shrink-0">
              {hasDiscount && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercentage}%
                </div>
              )}
              {product.condition && (
                <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  {product.condition}
                </div>
              )}
              {!imageError ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1">
                    {product.title}
                  </h3>
                  {showQuickActions && (
                    <button
                      onClick={handleToggleFavorite}
                      className={`ml-2 p-1 rounded-full transition-colors ${
                        isFavorited
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>

                {product.shortDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}

                {product.category && (
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-3">
                    {product.category.name}
                  </span>
                )}

                {/* Rating and Stats */}
                <div className="flex items-center gap-4 mb-3">
                  {product.averageRating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.averageRating.toFixed(1)} ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                  {showStats && product.soldCount && (
                    <span className="text-sm text-gray-500">
                      {product.soldCount} sold
                    </span>
                  )}
                </div>

                {showSellerInfo && (
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>by {sellerName}</span>
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.originalPrice!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {!product.shippingRequired && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Digital
                      </span>
                    )}
                    {product.shippingRequired && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Shipping
                      </span>
                    )}
                  </div>
                </div>

                {showQuickActions && onAddToCart && (
                  <button
                    onClick={handleAddToCart}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid layout (default)
  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden group"
      aria-labelledby={`product-title-${product.id}`}
    >
      <Link
        href={productUrl}
        className="block focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-xl"
        aria-label={`View details for ${product.title}`}
      >
        {/* Image Section */}
        <div className="aspect-square relative overflow-hidden">
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
          {product.condition && (
            <div className="absolute top-3 right-3 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {product.condition}
            </div>
          )}

          {showQuickActions && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 ${
                  isFavorited
                    ? 'bg-red-100 text-red-600'
                    : 'bg-white/80 text-gray-600 hover:bg-red-100 hover:text-red-600'
                }`}
                aria-label={isFavorited ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>
            </div>
          )}

          {!imageError ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Overlay Actions */}
          {showQuickActions && onAddToCart && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={`Add ${product.title} to cart`}
              >
                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </Link>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3
              id={`product-title-${product.id}`}
              className="font-semibold text-gray-900 line-clamp-2 flex-1"
            >
              {product.title}
            </h3>
          </div>

          {product.category && (
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-2">
              {product.category.name}
            </span>
          )}

          {/* Rating and Stats */}
          <div className="flex items-center justify-between mb-2">
            {product.averageRating ? (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.averageRating.toFixed(1)} ({product.reviewCount || 0})
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No reviews</span>
            )}

            {showStats && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {product.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.viewCount}
                  </div>
                )}
                {product.soldCount && (
                  <span>{product.soldCount} sold</span>
                )}
              </div>
            )}
          </div>

          {showSellerInfo && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span>by {sellerName}</span>
            </div>
          )}

          {/* Price and Delivery */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              {!product.shippingRequired ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Digital
                </span>
              ) : (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Shipping
                </span>
              )}
            </div>
          </div>
        </div>
    </article>
  );
}