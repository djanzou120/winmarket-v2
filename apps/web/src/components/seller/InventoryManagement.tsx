'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

// GraphQL queries and mutations
const INVENTORY_QUERY = gql`
  query InventoryManagement($pagination: PaginationInput, $filter: ProductFilter) {
    myProducts(pagination: $pagination, filter: $filter) {
      edges {
        node {
          id
          title
          slug
          stock
          price
          images
          status
          variants {
            id
            name
            stock
            price
            sku
          }
          category {
            name
          }
          updatedAt
        }
      }
      totalCount
    }
    inventoryAlerts {
      lowStock {
        productId
        productTitle
        currentStock
        threshold
      }
      outOfStock {
        productId
        productTitle
      }
      overstocked {
        productId
        productTitle
        currentStock
        threshold
      }
    }
  }
`;

const UPDATE_STOCK_MUTATION = gql`
  mutation UpdateStock($id: ID!, $stock: Int!) {
    updateProduct(id: $id, input: { stock: $stock }) {
      id
      stock
    }
  }
`;

const BULK_UPDATE_STOCK_MUTATION = gql`
  mutation BulkUpdateStock($updates: [StockUpdateInput!]!) {
    bulkUpdateStock(updates: $updates) {
      success
      updated
    }
  }
`;

interface StockUpdateProps {
  productId: string;
  currentStock: number;
  onUpdate: (productId: string, newStock: number) => void;
  onCancel: () => void;
}

const StockUpdateModal: React.FC<StockUpdateProps> = ({ productId, currentStock, onUpdate, onCancel }) => {
  const [newStock, setNewStock] = useState(currentStock);
  const [adjustment, setAdjustment] = useState(0);
  const [updateMode, setUpdateMode] = useState<'set' | 'adjust'>('set');

  const handleSave = () => {
    const finalStock = updateMode === 'set' ? newStock : currentStock + adjustment;
    onUpdate(productId, Math.max(0, finalStock));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Stock: {currentStock}</p>

            {/* Update Mode Toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setUpdateMode('set')}
                className={`px-3 py-1 text-sm rounded ${
                  updateMode === 'set' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Set Total
              </button>
              <button
                onClick={() => setUpdateMode('adjust')}
                className={`px-3 py-1 text-sm rounded ${
                  updateMode === 'adjust' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Adjust (+/-)
              </button>
            </div>

            {updateMode === 'set' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Stock Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Amount
                </label>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter positive or negative number"
                />
                <p className="text-sm text-gray-500 mt-1">
                  New total will be: {Math.max(0, currentStock + adjustment)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Stock
          </button>
        </div>
      </div>
    </div>
  );
};

interface InventoryManagementProps {
  showHeader?: boolean;
  compact?: boolean;
}

export function InventoryManagement({ showHeader = true, compact = false }: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'good'>('all');
  const [editingStock, setEditingStock] = useState<{ productId: string; currentStock: number } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data, loading, error, refetch } = useQuery(INVENTORY_QUERY, {
    variables: {
      pagination: compact ? { limit: 10, offset: 0 } : { limit: 50, offset: 0 },
      filter: {}
    },
    errorPolicy: 'all',
    pollInterval: 60000 // Refresh every minute
  });

  const [updateStock] = useMutation(UPDATE_STOCK_MUTATION, {
    onCompleted: () => {
      toast.success('Stock updated successfully');
      refetch();
      setEditingStock(null);
    },
    onError: (error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    }
  });

  const [bulkUpdateStock] = useMutation(BULK_UPDATE_STOCK_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Updated ${data.bulkUpdateStock.updated} products`);
      refetch();
      setSelectedProducts([]);
    },
    onError: (error) => {
      toast.error(`Failed to bulk update: ${error.message}`);
    }
  });

  const products = data?.myProducts?.edges?.map((edge: any) => edge.node) || [];
  const alerts = data?.inventoryAlerts || { lowStock: [], outOfStock: [], overstocked: [] };

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product: any) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product: any) => product.category?.name === selectedCategory);
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter((product: any) => product.stock > 0 && product.stock < 10);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter((product: any) => product.stock === 0);
    } else if (stockFilter === 'good') {
      filtered = filtered.filter((product: any) => product.stock >= 10);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const categories = [...new Set(products.map((p: any) => p.category?.name).filter(Boolean))] as string[];

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-50' };
    if (stock < 10) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    await updateStock({ variables: { id: productId, stock: newStock } });
  };

  const handleBulkStockAdjustment = async (adjustment: number) => {
    if (selectedProducts.length === 0) return;

    const updates = selectedProducts.map(productId => {
      const product = products.find((p: any) => p.id === productId);
      return {
        productId,
        stock: Math.max(0, (product?.stock || 0) + adjustment)
      };
    });

    await bulkUpdateStock({ variables: { updates } });
  };

  const selectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p: any) => p.id));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        {showHeader && (
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage your product stock levels
            </p>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {(alerts.lowStock.length > 0 || alerts.outOfStock.length > 0) && !compact && (
        <div className="space-y-3">
          {alerts.outOfStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Out of Stock ({alerts.outOfStock.length})
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>The following products are out of stock:</p>
                    <ul className="mt-1 list-disc list-inside">
                      {alerts.outOfStock.slice(0, 3).map((alert: any) => (
                        <li key={alert.productId}>{alert.productTitle}</li>
                      ))}
                      {alerts.outOfStock.length > 3 && (
                        <li>+{alerts.outOfStock.length - 3} more products</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {alerts.lowStock.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Low Stock Alert ({alerts.lowStock.length})
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>These products are running low:</p>
                    <ul className="mt-1 list-disc list-inside">
                      {alerts.lowStock.slice(0, 3).map((alert: any) => (
                        <li key={alert.productId}>
                          {alert.productTitle} ({alert.currentStock} remaining)
                        </li>
                      ))}
                      {alerts.lowStock.length > 3 && (
                        <li>+{alerts.lowStock.length - 3} more products</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {!compact && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 lg:max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Stock Levels</option>
                <option value="out">Out of Stock</option>
                <option value="low">Low Stock</option>
                <option value="good">Good Stock</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && !compact && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkStockAdjustment(10)}
                className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded text-green-700 bg-white hover:bg-green-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add 10
              </button>
              <button
                onClick={() => handleBulkStockAdjustment(-10)}
                className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm font-medium rounded text-yellow-700 bg-white hover:bg-yellow-50"
              >
                <MinusIcon className="h-4 w-4 mr-1" />
                Remove 10
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

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {!compact && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={selectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product: any) => {
                const stockStatus = getStockStatus(product.stock);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    {!compact && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => selectProduct(product.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
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
                          {product.variants && product.variants.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock}
                        </span>
                        {stockStatus.status !== 'good' && (
                          <ExclamationTriangleIcon className={`ml-2 h-4 w-4 ${stockStatus.color}`} />
                        )}
                      </div>
                      {product.variants?.map((variant: any) => (
                        <div key={variant.id} className="text-xs text-gray-500 mt-1">
                          {variant.name}: {variant.stock}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status === 'out' ? 'Out of Stock' :
                         stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingStock({ productId: product.id, currentStock: product.stock })}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Update stock"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
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
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm">
                {searchQuery || selectedCategory || stockFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add some products to start managing inventory'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {editingStock && (
        <StockUpdateModal
          productId={editingStock.productId}
          currentStock={editingStock.currentStock}
          onUpdate={handleStockUpdate}
          onCancel={() => setEditingStock(null)}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading inventory
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load inventory data. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}