'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ProductDocument, RelatedProductsDocument, AddToCartDocument, BuyNowDocument } from '@/graphql/generated';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  MessageSquare,
  MapPin,
  Clock,
  Package,
  Zap,
  ChevronDown,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductCard } from '@/components/products/ProductCard';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

// Mock product data
const mockProduct = {
  id: '1',
  title: 'MacBook Pro 14-inch M3 Max - Space Black',
  slug: 'macbook-pro-14-inch-m3-max-space-black',
  description: `
    <p>Experience the power of the M3 Max chip in the stunning 14-inch MacBook Pro. Built for professionals who demand the ultimate in performance, this machine delivers unprecedented speed for the most demanding creative workflows.</p>

    <h3>Key Features:</h3>
    <ul>
      <li>Apple M3 Max chip with 12-core CPU and up to 40-core GPU</li>
      <li>14-inch Liquid Retina XDR display with 1600 nits peak brightness</li>
      <li>Up to 128GB unified memory</li>
      <li>Up to 8TB SSD storage</li>
      <li>Three Thunderbolt 4 ports, HDMI port, SDXC card slot, headphone jack, MagSafe 3 port</li>
      <li>1080p FaceTime HD camera</li>
      <li>Six-speaker sound system with force-cancelling woofers</li>
      <li>Studio-quality three-mic array</li>
      <li>Up to 18 hours battery life</li>
    </ul>

    <h3>What's in the Box:</h3>
    <ul>
      <li>MacBook Pro</li>
      <li>140W USB-C Power Adapter</li>
      <li>USB-C to MagSafe 3 Cable (2 m)</li>
    </ul>
  `,
  shortDescription: 'Professional 14-inch laptop with M3 Max chip, perfect for demanding creative workflows.',
  price: 3199,
  originalPrice: 3499,
  condition: 'new',
  status: 'active',
  stock: 15,
  minOrderQuantity: 1,
  maxOrderQuantity: 5,
  weight: '1.6 kg',
  dimensions: '31.26 × 22.12 × 1.55 cm',
  sku: 'MBP-14-M3MAX-SB-1TB',
  tags: ['apple', 'macbook', 'laptop', 'professional', 'm3-max'],
  images: [
    '/placeholder-macbook-1.jpg',
    '/placeholder-macbook-2.jpg',
    '/placeholder-macbook-3.jpg',
    '/placeholder-macbook-4.jpg'
  ],
  isDigital: false,
  shippingRequired: true,
  allowReviews: true,
  averageRating: 4.8,
  reviewCount: 127,
  soldCount: 89,
  favoriteCount: 234,
  viewCount: 1567,
  seller: {
    id: 'seller-1',
    firstName: 'TechStore',
    lastName: 'Pro',
    avatar: null,
    profile: {
      bio: 'Premium electronics retailer with 10+ years of experience. Authorized Apple reseller.',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'United States'
    }
  },
  category: {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    parent: null
  },
  variants: [
    {
      id: '1',
      name: 'Storage',
      value: '1TB SSD',
      price: 3199,
      stock: 15,
      sku: 'MBP-14-M3MAX-SB-1TB',
      image: null,
      isActive: true
    },
    {
      id: '2',
      name: 'Storage',
      value: '2TB SSD',
      price: 3599,
      stock: 8,
      sku: 'MBP-14-M3MAX-SB-2TB',
      image: null,
      isActive: true
    },
    {
      id: '3',
      name: 'Storage',
      value: '4TB SSD',
      price: 4399,
      stock: 3,
      sku: 'MBP-14-M3MAX-SB-4TB',
      image: null,
      isActive: true
    }
  ],
  createdAt: '2024-01-15T10:00:00Z',
  publishedAt: '2024-01-15T10:00:00Z'
};

const mockRelatedProducts = Array.from({ length: 4 }, (_, index) => ({
  id: `related-${index + 1}`,
  title: `Related Product ${index + 1}`,
  slug: `related-product-${index + 1}`,
  shortDescription: 'Another great product you might like.',
  price: Math.floor(Math.random() * 1000) + 100,
  originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 1200) + 150 : undefined,
  images: ['/placeholder-product.jpg'],
  averageRating: Math.random() * 2 + 3,
  reviewCount: Math.floor(Math.random() * 100) + 1,
  seller: {
    id: `seller-${index + 1}`,
    firstName: 'Seller',
    lastName: `${index + 1}`
  },
  category: {
    id: 'electronics',
    name: 'Electronics'
  }
}));

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // State
  const [selectedVariant, setSelectedVariant] = useState(mockProduct.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('description');

  // GraphQL queries
  const { data: productData, loading: productLoading } = useQuery(ProductDocument, {
    variables: { id: productId },
    errorPolicy: 'ignore',
  });

  const { data: relatedData } = useQuery(RelatedProductsDocument, {
    variables: { productId, limit: 4 },
    errorPolicy: 'ignore',
  });

  const [addToCartMutation] = useMutation(AddToCartDocument);
  const [buyNowMutation] = useMutation(BuyNowDocument);

  const product = productData?.product || mockProduct;
  const relatedProducts = relatedData?.relatedProducts || mockRelatedProducts;

  if (productLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="aspect-square bg-gray-300 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4" />
                <div className="h-6 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse all products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock;
  const hasDiscount = product.originalPrice && product.originalPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - currentPrice) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      await addToCartMutation({
        variables: {
          input: {
            productId: product.id,
            productVariantId: selectedVariant?.id || undefined,
            quantity,
          },
        },
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      const { data } = await buyNowMutation({
        variables: {
          input: {
            productId: product.id,
            productVariantId: selectedVariant?.id || undefined,
            quantity,
          },
        },
      });
      if (data?.buyNow) {
        router.push(`/checkout/success?order=${data.buyNow.orderNumber}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process purchase');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Implement favorite toggle
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription,
          url: window.location.href
        });
      } catch {
        // Share dialog was canceled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          {product.category.parent && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.parent.slug}`} className="hover:text-gray-900">
                {product.category.parent.name}
              </Link>
            </>
          )}
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-gray-900">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.title}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery
              images={product.images}
              productTitle={product.title}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                    -{discountPercentage}% OFF
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                  {product.condition}
                </span>
                {product.isDigital ? (
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Digital
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Physical
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  {product.viewCount} views
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice!.toLocaleString()}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-green-600 font-semibold">
                    Save ${(product.originalPrice! - currentPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-3">
                  {product.variants.map((variant: any) => (
                    <label
                      key={variant.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => setSelectedVariant(variant)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-medium">{variant.value}</span>
                          {variant.stock <= 5 && variant.stock > 0 && (
                            <span className="text-orange-600 text-sm ml-2">
                              Only {variant.stock} left
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold">
                        ${variant.price.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {[...Array(Math.min(currentStock, product.maxOrderQuantity || 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  <span className={currentStock > 10 ? 'text-green-600' : currentStock > 0 ? 'text-orange-600' : 'text-red-600'}>
                    {currentStock > 10
                      ? 'In stock'
                      : currentStock > 0
                      ? `Only ${currentStock} left`
                      : 'Out of stock'
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    isFavorited
                      ? 'border-red-300 text-red-600 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Sold by</h3>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {product.seller.firstName[0]}{product.seller.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {product.seller.firstName} {product.seller.lastName}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.seller.profile?.bio}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {product.seller.profile?.city}, {product.seller.profile?.country}
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Contact Seller
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            {product.shippingRequired && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping & Delivery
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Standard shipping: 3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span>Secure packaging and handling</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="border-t border-gray-200 pt-8 mb-16">
          <div className="max-w-4xl mx-auto">
            {/* Description */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('description')}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === 'description' ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedSection === 'description' && (
                <div className="pb-6">
                  <div className="prose prose-gray max-w-none whitespace-pre-wrap">
                    {product.description}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleSection('specifications')}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === 'specifications' ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedSection === 'specifications' && (
                <div className="pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-gray-900">SKU</dt>
                      <dd className="text-gray-600">{product.sku}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Weight</dt>
                      <dd className="text-gray-600">{product.weight}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Dimensions</dt>
                      <dd className="text-gray-600">{product.dimensions}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Condition</dt>
                      <dd className="text-gray-600 capitalize">{product.condition}</dd>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <button
                onClick={() => toggleSection('reviews')}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Reviews ({product.reviewCount})
                </h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === 'reviews' ? 'rotate-180' : ''
                }`} />
              </button>
              {expandedSection === 'reviews' && (
                <div className="pb-6">
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Reviews component will be implemented in Phase 6</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  showSellerInfo={false}
                  showStats={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}