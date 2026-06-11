'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole, ProductStatus } from '@/graphql/generated';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// GraphQL queries and mutations
const MY_PRODUCTS_QUERY = gql`
  query MyProducts($pagination: PaginationInput, $filter: ProductFilter) {
    myProducts(pagination: $pagination, filter: $filter) {
      edges {
        node {
          id
          title
          slug
          description
          price
          stock
          status
          condition
          images
          category {
            id
            name
          }
          variants {
            id
            name
            price
            sku
            isActive
          }
          reviews {
            rating
          }
          createdAt
          updatedAt
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

const UPDATE_PRODUCT_STATUS_MUTATION = gql`
  mutation UpdateProductStatus($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      status
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

interface ProductFilters {
  status?: ProductStatus;
  categoryId?: string;
  lowStock?: boolean;
  search?: string;
}

export default function SellerProductsPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // Build filter for GraphQL query
  const graphQLFilter = useMemo(() => {
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.categoryId) filter.categoryId = filters.categoryId;
    if (filters.search) filter.title = { contains: filters.search };
    return filter;
  }, [filters]);

  const { data, loading, error, refetch } = useQuery(MY_PRODUCTS_QUERY, {
    variables: {
      pagination: { limit: itemsPerPage, offset },
      filter: graphQLFilter
    },
    skip: !isAuthenticated || user?.userType !== UserRole.Seller,
    errorPolicy: 'all'
  });

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY, {
    skip: !isAuthenticated
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION, {
    onCompleted: () => {
      toast.success('Product deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  const [updateProductStatus] = useMutation(UPDATE_PRODUCT_STATUS_MUTATION, {
    onCompleted: () => {
      toast.success('Product status updated');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auth check
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role check
  if (user.userType !== UserRole.Seller) {
    redirect('/dashboard');
  }

  const products = data?.myProducts?.edges?.map((edge: any) => edge.node) || [];
  const totalCount = data?.myProducts?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const categories = categoriesData?.categories?.edges?.map((edge: any) => edge.node) || [];

  // Filter products for low stock and other client-side filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (filters.lowStock) {
      filtered = filtered.filter((product: any) => product.stock < 10);
    }

    return filtered;
  }, [products, filters]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      await deleteProduct({ variables: { id: productId } });
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: ProductStatus) => {
    const newStatus = currentStatus === ProductStatus.Active ? ProductStatus.Draft : ProductStatus.Active;
    await updateProductStatus({
      variables: {
        id: productId,
        input: { status: newStatus }
      }
    });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p: any) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      for (const productId of selectedProducts) {
        await deleteProduct({ variables: { id: productId } });
      }
      setSelectedProducts([]);
    }
  };

  const getAverageRating = (reviews: any[]) => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.Active:
        return 'bg-green-100 text-green-800';
      case ProductStatus.Draft:
        return 'bg-gray-100 text-gray-800';
      case ProductStatus.Archived:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Product Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your product catalog and inventory
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <Link
                  href="/dashboard/seller/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 lg:max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <p className="font-medium text-gray-900">{totalCount}</p>
                <p className="text-gray-500">Total Products</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">
                  {products.filter((p: any) => p.status === ProductStatus.Active).length}
                </p>
                <p className="text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-yellow-600">
                  {products.filter((p: any) => p.stock < 10).length}
                </p>
                <p className="text-gray-500">Low Stock</p>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      status: e.target.value as ProductStatus || undefined
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value={ProductStatus.Active}>Active</option>
                    <option value={ProductStatus.Draft}>Draft</option>
                    <option value={ProductStatus.Archived}>Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.categoryId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters(prev => {
                        const next = { ...prev };
                        if (val) {
                          next.categoryId = val;
                        } else {
                          delete next.categoryId;
                        }
                        return next;
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.lowStock || false}
                      onChange={(e) => {
                        const { checked } = e.target;
                        setFilters(prev => {
                          const next = { ...prev };
                          if (checked) {
                            next.lowStock = true;
                          } else {
                            delete next.lowStock;
                          }
                          return next;
                        });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Low Stock Alert</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({})}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product: any) => {
                  const avgRating = getAverageRating(product.reviews);
                  const isLowStock = product.stock < 10;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images?.[0] ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0]}
                                alt={product.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">📦</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.condition} • Created {new Date(product.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                        {product.variants?.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLowStock ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {product.stock}
                          {isLowStock && (
                            <ExclamationTriangleIcon className="inline h-4 w-4 ml-1 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                          </span>
                          {avgRating > 0 && (
                            <span className="ml-1 text-yellow-400">⭐</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.reviews?.length || 0} review{product.reviews?.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="View product"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/dashboard/seller/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit product"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleStatusToggle(product.id, product.status)}
                            className={`${
                              product.status === ProductStatus.Active
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={product.status === ProductStatus.Active ? 'Set to draft' : 'Activate product'}
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete product"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {filters.search || filters.status || filters.categoryId || filters.lowStock ? (
                  <>
                    <p className="text-lg mb-2">No products match your filters</p>
                    <button
                      onClick={() => setFilters({})}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear filters to see all products
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-lg mb-2">No products yet</p>
                    <Link
                      href="/dashboard/seller/products/new"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Add your first product
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{offset + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(offset + itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load products. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}