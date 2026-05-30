import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

const stats = [
  {
    name: 'Total Users',
    value: '12,345',
    change: '+12.5%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Total Products',
    value: '8,901',
    change: '+8.1%',
    changeType: 'positive',
    icon: Package,
  },
  {
    name: 'Total Orders',
    value: '3,456',
    change: '+23.2%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Total Revenue',
    value: '$123,456',
    change: '+15.3%',
    changeType: 'positive',
    icon: DollarSign,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}