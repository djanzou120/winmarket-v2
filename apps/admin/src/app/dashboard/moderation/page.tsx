'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Image,
  MessageSquare,
  Package,
  User,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { AdminRouteGuard } from '@/components/auth/admin-route-guard';
import { ModerationQueue } from '@/components/moderation/moderation-queue';
import { ModerationStats } from '@/components/moderation/moderation-stats';
import { ReportDetails } from '@/components/moderation/report-details';

interface Report {
  id: string;
  type: 'PRODUCT' | 'USER' | 'REVIEW' | 'MESSAGE';
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Reporter info
  reporterId: string;
  reporterName: string;
  reporterEmail: string;

  // Reported content/user
  reportedUserId?: string;
  reportedUserName?: string;
  reportedProductId?: string;
  reportedProductName?: string;
  reportedReviewId?: string;
  reportedMessageId?: string;

  // Metadata
  evidence: string[];
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedToday: number;
  averageResolutionTime: number;
  reportsByType: {
    [key: string]: number;
  };
  reportsByPriority: {
    [key: string]: number;
  };
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for development
  useEffect(() => {
    const loadModerationData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockReports: Report[] = [
        {
          id: 'rpt_001',
          type: 'PRODUCT',
          reason: 'FAKE_PRODUCT',
          description: 'This product listing appears to be selling counterfeit branded items. The images look suspicious and the price is unrealistically low.',
          status: 'PENDING',
          priority: 'HIGH',
          reporterId: 'user_123',
          reporterName: 'John Doe',
          reporterEmail: 'john@example.com',
          reportedProductId: 'prod_456',
          reportedProductName: 'Fake Designer Handbag',
          evidence: ['screenshot1.png', 'comparison.jpg'],
          createdAt: '2024-06-07T10:30:00Z',
          updatedAt: '2024-06-07T10:30:00Z',
        },
        {
          id: 'rpt_002',
          type: 'USER',
          reason: 'HARASSMENT',
          description: 'User has been sending threatening messages to buyers who leave negative reviews.',
          status: 'INVESTIGATING',
          priority: 'URGENT',
          reporterId: 'user_789',
          reporterName: 'Jane Smith',
          reporterEmail: 'jane@example.com',
          reportedUserId: 'user_666',
          reportedUserName: 'BadSeller99',
          evidence: ['messages.txt', 'screenshot2.png'],
          assignedTo: 'admin_001',
          assignedToName: 'Admin Mike',
          createdAt: '2024-06-06T15:45:00Z',
          updatedAt: '2024-06-07T09:15:00Z',
        },
        {
          id: 'rpt_003',
          type: 'REVIEW',
          reason: 'SPAM',
          description: 'Multiple fake 5-star reviews posted for this product with identical text patterns.',
          status: 'RESOLVED',
          priority: 'MEDIUM',
          reporterId: 'user_321',
          reporterName: 'Bob Wilson',
          reporterEmail: 'bob@example.com',
          reportedProductId: 'prod_789',
          reportedProductName: 'Bluetooth Speaker',
          reportedReviewId: 'rev_123',
          evidence: ['review_analysis.pdf'],
          assignedTo: 'admin_002',
          assignedToName: 'Admin Sarah',
          resolution: 'Removed 12 fake reviews and warned the seller.',
          createdAt: '2024-06-05T11:20:00Z',
          updatedAt: '2024-06-06T14:30:00Z',
          resolvedAt: '2024-06-06T14:30:00Z',
        },
        {
          id: 'rpt_004',
          type: 'PRODUCT',
          reason: 'INAPPROPRIATE_CONTENT',
          description: 'Product contains explicit content not suitable for the platform.',
          status: 'DISMISSED',
          priority: 'LOW',
          reporterId: 'user_555',
          reporterName: 'Carol Brown',
          reporterEmail: 'carol@example.com',
          reportedProductId: 'prod_111',
          reportedProductName: 'Art Print Collection',
          evidence: ['report.txt'],
          assignedTo: 'admin_001',
          assignedToName: 'Admin Mike',
          resolution: 'After review, content is within platform guidelines.',
          createdAt: '2024-06-04T09:10:00Z',
          updatedAt: '2024-06-05T16:45:00Z',
          resolvedAt: '2024-06-05T16:45:00Z',
        },
      ];

      const mockStats: ModerationStats = {
        totalReports: 247,
        pendingReports: 18,
        resolvedToday: 12,
        averageResolutionTime: 2.5, // hours
        reportsByType: {
          PRODUCT: 156,
          USER: 45,
          REVIEW: 34,
          MESSAGE: 12,
        },
        reportsByPriority: {
          LOW: 89,
          MEDIUM: 102,
          HIGH: 45,
          URGENT: 11,
        },
      };

      setReports(mockReports);
      setStats(mockStats);
      setLoading(false);
    };

    loadModerationData();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || report.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || report.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || report.priority === selectedPriority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleReportAction = (reportId: string, action: string, resolution?: string) => {
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? {
            ...report,
            status: action === 'resolve' ? 'RESOLVED' : action === 'dismiss' ? 'DISMISSED' : 'INVESTIGATING',
            resolution,
            resolvedAt: action === 'resolve' || action === 'dismiss' ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : report
    ));
    setSelectedReport(null);
  };

  const handleAssignReport = (reportId: string, adminId: string, adminName: string) => {
    setReports(prev => prev.map(report =>
      report.id === reportId
        ? {
            ...report,
            assignedTo: adminId,
            assignedToName: adminName,
            status: 'INVESTIGATING',
            updatedAt: new Date().toISOString(),
          }
        : report
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return <Package className="w-4 h-4" />;
      case 'USER':
        return <User className="w-4 h-4" />;
      case 'REVIEW':
        return <MessageSquare className="w-4 h-4" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'INVESTIGATING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminRouteGuard requiredPermission={{ resource: 'MODERATION', action: 'READ' }}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-red-600" />
              Content Moderation
            </h1>
            <p className="text-gray-600 mt-2">
              Review and moderate user reports, content violations, and platform safety
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Moderation Statistics */}
        {stats && <ModerationStats stats={stats} loading={loading} />}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="PRODUCT">Products</option>
                <option value="USER">Users</option>
                <option value="REVIEW">Reviews</option>
                <option value="MESSAGE">Messages</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priority</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Moderation Queue */}
        <ModerationQueue
          reports={filteredReports}
          loading={loading}
          onSelectReport={setSelectedReport}
          onReportAction={handleReportAction}
          onAssignReport={handleAssignReport}
          getTypeIcon={getTypeIcon}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />

        {/* Report Details Modal */}
        {selectedReport && (
          <ReportDetails
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onReportAction={handleReportAction}
            getTypeIcon={getTypeIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </AdminRouteGuard>
  );
}