const topProducts = [
  { id: 1, name: 'MacBook Pro 14"', sales: 156, revenue: 311400 },
  { id: 2, name: 'iPhone 15 Pro', sales: 234, revenue: 280800 },
  { id: 3, name: 'AirPods Pro', sales: 445, revenue: 110250 },
  { id: 4, name: 'iPad Air', sales: 189, revenue: 113400 },
  { id: 5, name: 'Apple Watch', sales: 267, revenue: 106800 },
];

export function TopProducts() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
      <div className="space-y-4">
        {topProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">{product.sales} sales</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">revenue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}