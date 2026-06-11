'use client';

import { useState } from 'react';
import {
  Eye,
  User,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Report {
  id: string;
  type: 'PRODUCT' | 'USER' | 'REVIEW' | 'MESSAGE';
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reporterName: string;
  reportedUserName?: string;
  reportedProductName?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ModerationQueueProps {
  reports: Report[];
  loading: boolean;
  onSelectReport: (report: Report) => void;
  onReportAction: (reportId: string, action: string, resolution?: string) => void;
  onAssignReport: (reportId: string, adminId: string, adminName: string) => void;
  getTypeIcon: (type: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const REPORTS_PER_PAGE = 10;

export function ModerationQueue({
  reports,
  loading,
  onSelectReport,
  onReportAction,
  onAssignReport,
  getTypeIcon,
  getPriorityColor,
  getStatusColor,
}: ModerationQueueProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const totalPages = Math.ceil(reports.length / REPORTS_PER_PAGE);
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
  const endIndex = startIndex + REPORTS_PER_PAGE;
  const paginatedReports = reports.slice(startIndex, endIndex);

  const handleQuickAction = (reportId: string, action: string) => {
    if (action === 'assign') {
      // TODO: Show admin selection modal
      onAssignReport(reportId, 'admin_001', 'Current Admin');
    } else {
      onReportAction(reportId, action);
    }
    setShowActionMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Moderation Queue ({reports.length} reports)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedReports.map((report) => (
              <tr
                key={report.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  report.priority === 'URGENT' ? 'border-l-4 border-red-500' :
                  report.priority === 'HIGH' ? 'border-l-4 border-orange-500' : ''
                }`}
                onClick={() => onSelectReport(report)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        #{report.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.reason.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {report.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      {getTypeIcon(report.type)}
                      <span className="ml-2 text-sm text-gray-900">
                        {report.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(report.priority)}`}>
                      {report.priority === 'URGENT' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {report.priority}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {report.reportedProductName || report.reportedUserName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reported by: {report.reporterName}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status === 'RESOLVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {report.status === 'DISMISSED' && <XCircle className="w-3 h-3 mr-1" />}
                    {report.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                    {report.status}
                  </span>
                  {report.assignedToName && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {report.assignedToName}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formatDate(report.createdAt)}</div>
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(report.createdAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(showActionMenu === report.id ? null : report.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActionMenu === report.id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectReport(report);
                              setShowActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-3" />
                            View Details
                          </button>

                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(report.id, 'assign');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                              >
                                <User className="w-4 h-4 mr-3" />
                                Assign to Me
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(report.id, 'dismiss');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle className="w-4 h-4 mr-3" />
                                Quick Dismiss
                              </button>
                            </>
                          )}

                          {report.status === 'INVESTIGATING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction(report.id, 'resolve');
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-3" />
                              Quick Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, reports.length)}</span> of{' '}
                <span className="font-medium">{reports.length}</span> reports
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
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
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}