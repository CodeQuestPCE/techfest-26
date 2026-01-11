'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { FileText, Search, Filter, Calendar, User, Home, LogOut, Activity, Shield, Sparkles } from 'lucide-react';
import AdminMobileMenu from '@/components/AdminMobileMenu';

export default function AdminLogsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const response = await api.get('/logs');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  if (!isAuthenticated() || user?.role !== 'admin') {
    return null;
  }

  const filteredLogs = logs?.filter((log: any) => {
    const matchesSearch = !searchTerm || 
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const actionTypes: string[] = Array.from(new Set(logs?.map((log: any) => log.action) || []));

  const getActionColor = (action: string) => {
    if (action.includes('approve')) return 'bg-green-100 text-green-800';
    if (action.includes('reject')) return 'bg-red-100 text-red-800';
    if (action.includes('create')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('update')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approve')) return '✅';
    if (action.includes('reject')) return '❌';
    if (action.includes('create')) return '➕';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('update')) return '✏️';
    return '📝';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            EventHub Admin
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Payments
            </Link>
            <Link href="/admin/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Events
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Users
            </Link>
            <Link href="/admin/registrations" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Registrations
            </Link>
            <Link href="/admin/analytics" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Analytics
            </Link>
            <Link href="/admin/logs" className="text-purple-600 font-semibold">
              Logs
            </Link>
            <Link href="/admin/scanner" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Scanner
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <AdminMobileMenu currentPath="/admin/logs" onLogout={() => { logout(); router.push('/'); }} />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Audit Logs
          </h1>
          <p className="text-gray-600 mt-2">Track all administrative actions and system events</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Logs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user, email, or action..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Actions</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs?.map((log: any) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{log.user?.name || 'System'}</div>
                            <div className="text-sm text-gray-500">{log.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                          <span>{getActionIcon(log.action)}</span>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.ipAddress || 'N/A'}
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredLogs?.map((log: any) => (
                  <div key={log._id} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 flex-1 min-w-0">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${getActionColor(log.action)}`}>
                          <span>{getActionIcon(log.action)}</span>
                          {log.action}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{log.user?.name || 'System'}</div>
                          <div className="text-sm text-gray-500 truncate">{log.user?.email || 'N/A'}</div>
                        </div>
                      </div>

                      {log.details && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-words">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                        </div>
                      )}

                      {log.ipAddress && (
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredLogs?.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No logs found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Actions</h3>
            <p className="text-3xl font-bold text-gray-900">{logs?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Today</h3>
            <p className="text-3xl font-bold text-blue-600">
              {logs?.filter((log: any) => new Date(log.createdAt).toDateString() === new Date().toDateString()).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">This Week</h3>
            <p className="text-3xl font-bold text-green-600">
              {logs?.filter((log: any) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(log.createdAt) >= weekAgo;
              }).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Unique Users</h3>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(logs?.map((log: any) => log.user?._id).filter(Boolean)).size || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
