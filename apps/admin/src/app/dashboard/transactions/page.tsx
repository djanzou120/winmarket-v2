'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AdminRouteGuard } from '@/components/auth/admin-route-guard';

interface Transaction {
  id: string;
  type: 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'WALLET_DEPOSIT' | 'WALLET_WITHDRAWAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  description: string;
  paymentMethod: string;
  processingFee?: number;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  metadata?: any;
}

interface TransactionStats {
  totalVolume: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageAmount: number;
  commissionEarned: number;
  processingFees: number;
  pendingTransactions: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  // Mock data for development
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTransactions: Transaction[] = [
        {
          id: 'txn_001',
          type: 'PAYMENT',
          status: 'COMPLETED',
          amount: 299.99,
          currency: 'USD',
          userId: 'user_001',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          orderId: 'ord_123',
          description: 'Product purchase - Wireless Headphones',
          paymentMethod: 'Credit Card (****4242)',
          processingFee: 8.99,
          createdAt: '2024-06-07T10:30:00Z',
          completedAt: '2024-06-07T10:30:15Z',
        },
        {
          id: 'txn_002',
          type: 'COMMISSION',
          status: 'COMPLETED',
          amount: 44.99,
          currency: 'USD',
          userId: 'seller_001',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          orderId: 'ord_123',
          description: 'Commission from sale - Wireless Headphones',
          paymentMethod: 'Platform Wallet',
          createdAt: '2024-06-07T10:31:00Z',
          completedAt: '2024-06-07T10:31:05Z',
        },
        {
          id: 'txn_003',
          type: 'REFUND',
          status: 'PENDING',
          amount: 149.50,
          currency: 'USD',
          userId: 'user_002',
          userName: 'Bob Johnson',
          userEmail: 'bob@example.com',
          orderId: 'ord_124',
          description: 'Refund for returned item - Smart Watch',
          paymentMethod: 'Credit Card (****5678)',
          createdAt: '2024-06-07T09:15:00Z',
        },
        {
          id: 'txn_004',
          type: 'PAYMENT',
          status: 'FAILED',
          amount: 89.99,
          currency: 'USD',
          userId: 'user_003',
          userName: 'Alice Brown',
          userEmail: 'alice@example.com',
          orderId: 'ord_125',
          description: 'Product purchase - Bluetooth Speaker',
          paymentMethod: 'Credit Card (****9999)',
          processingFee: 2.69,
          createdAt: '2024-06-07T08:45:00Z',
          failureReason: 'Insufficient funds',
        },
        {
          id: 'txn_005',
          type: 'WALLET_DEPOSIT',
          status: 'COMPLETED',
          amount: 500.00,
          currency: 'USD',
          userId: 'user_004',
          userName: 'Charlie Wilson',
          userEmail: 'charlie@example.com',
          description: 'Wallet deposit from bank account',
          paymentMethod: 'Bank Transfer',
          processingFee: 5.00,
          createdAt: '2024-06-06T16:20:00Z',
          completedAt: '2024-06-06T16:22:00Z',
        },
      ];

      const mockStats: TransactionStats = {
        totalVolume: 125750.50,
        totalTransactions: 1247,
        successfulTransactions: 1186,
        failedTransactions: 61,
        averageAmount: 100.84,
        commissionEarned: 18862.58,
        processingFees: 3773.26,
        pendingTransactions: 23,
      };

      setTransactions(mockTransactions);
      setStats(mockStats);
      setLoading(false);
    };

    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || transaction.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || transaction.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRefresh = () => {
    // TODO: Implement data refresh
    console.log('Refreshing transaction data...');
  };

  const handleExport = () => {
    // TODO: Implement transaction export
    console.log('Exporting transactions...');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'REFUND':
        return <ArrowDownRight className="w-4 h-4 text-orange-500" />;
      case 'COMMISSION':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'WALLET_DEPOSIT':
        return <Wallet className="w-4 h-4 text-purple-500" />;
      case 'WALLET_WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminRouteGuard requiredPermission={{ resource: 'TRANSACTIONS', action: 'READ' }}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-8 h-8 mr-3 text-green-600" />
              Transaction Monitoring
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor payments, refunds, and financial activities in real-time
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalVolume)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600">
                  {stats.totalTransactions} transactions
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {stats.failedTransactions} failed
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.commissionEarned)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">
                  {formatCurrency(stats.averageAmount)} avg
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingTransactions}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-yellow-600">
                  Requires attention
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="PAYMENT">Payments</option>
                <option value="REFUND">Refunds</option>
                <option value="COMMISSION">Commission</option>
                <option value="WALLET_DEPOSIT">Wallet Deposit</option>
                <option value="WALLET_WITHDRAWAL">Wallet Withdrawal</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.description}
                          </div>
                          {transaction.orderId && (
                            <div className="text-xs text-blue-600">
                              Order: {transaction.orderId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.userEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.paymentMethod}
                      </div>
                      {transaction.processingFee && (
                        <div className="text-xs text-gray-400">
                          Fee: {formatCurrency(transaction.processingFee)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {transaction.status}
                        </span>
                      </div>
                      {transaction.failureReason && (
                        <div className="text-xs text-red-500 mt-1">
                          {transaction.failureReason}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(transaction.createdAt)}</div>
                      {transaction.completedAt && (
                        <div className="text-xs text-green-600">
                          Completed: {formatDate(transaction.completedAt)}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => console.log('View transaction:', transaction.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
}