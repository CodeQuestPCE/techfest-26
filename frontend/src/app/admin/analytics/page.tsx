'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { BarChart3, Users, Calendar, IndianRupee, CheckCircle, Clock, XCircle, Home, LogOut, TrendingUp, Award, Sparkles, Shield } from 'lucide-react';
import AdminMobileMenu from '@/components/AdminMobileMenu';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const { data: registrations } = useQuery({
    queryKey: ['admin-all-registrations'],
    queryFn: async () => {
      const response = await api.get('/admin/registrations');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const { data: events } = useQuery({
    queryKey: ['admin-events-analytics'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users-analytics'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const { data: ambassadors } = useQuery({
    queryKey: ['admin-ambassadors-analytics'],
    queryFn: async () => {
      const response = await api.get('/ambassadors/leaderboard?limit=5');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  if (!isAuthenticated() || user?.role !== 'admin') {
    return null;
  }

  const stats = {
    totalUsers: users?.length || 0,
    totalEvents: events?.length || 0,
    totalRegistrations: registrations?.length || 0,
    pendingRegistrations: registrations?.filter((r: any) => r.status === 'pending').length || 0,
    verifiedRegistrations: registrations?.filter((r: any) => r.status === 'verified').length || 0,
    rejectedRegistrations: registrations?.filter((r: any) => r.status === 'rejected').length || 0,
    totalRevenue: registrations?.filter((r: any) => r.status === 'verified')
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0) || 0,
    averageRegistrationFee: events?.length > 0 
      ? Math.round(events.reduce((sum: number, e: any) => sum + (e.registrationFee || 0), 0) / events.length)
      : 0,
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
            <Link href="/admin/analytics" className="text-purple-600 font-semibold">
              Analytics
            </Link>
            <Link href="/admin/logs" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
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
          <AdminMobileMenu currentPath="/admin/analytics" onLogout={() => { logout(); router.push('/'); }} />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Overview of platform statistics and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-2">Registered on platform</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
            <p className="text-sm text-gray-500 mt-2">Published events</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Registrations</h3>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
            <p className="text-sm text-gray-500 mt-2">Total registrations</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
              <IndianRupee className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">From verified payments</p>
          </div>
        </div>

        {/* Registration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            </div>
            <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingRegistrations}</p>
            <p className="text-sm text-gray-600">Awaiting verification</p>
            <Link
              href="/admin/dashboard"
              className="mt-4 inline-block text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              View pending →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
            </div>
            <p className="text-4xl font-bold text-green-600 mb-2">{stats.verifiedRegistrations}</p>
            <p className="text-sm text-gray-600">Approved registrations</p>
            <div className="mt-4 text-sm text-gray-500">
              Conversion: {stats.totalRegistrations > 0 ? Math.round((stats.verifiedRegistrations / stats.totalRegistrations) * 100) : 0}%
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Rejected</h3>
            </div>
            <p className="text-4xl font-bold text-red-600 mb-2">{stats.rejectedRegistrations}</p>
            <p className="text-sm text-gray-600">Declined payments</p>
            <div className="mt-4 text-sm text-gray-500">
              {stats.totalRegistrations > 0 ? Math.round((stats.rejectedRegistrations / stats.totalRegistrations) * 100) : 0}% rejection rate
            </div>
          </div>
        </div>

        {/* Top Ambassadors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Ambassadors
            </h3>
            <div className="space-y-3">
              {ambassadors?.map((ambassador: any, index: number) => (
                <div key={ambassador._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ambassador.name}</p>
                      <p className="text-sm text-gray-600">{ambassador.college}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{ambassador.points}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Avg. Registration Fee</span>
                <span className="font-bold text-gray-900">₹{stats.averageRegistrationFee}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Ambassadors</span>
                <span className="font-bold text-gray-900">
                  {users?.filter((u: any) => u.role === 'ambassador').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Coordinators</span>
                <span className="font-bold text-gray-900">
                  {users?.filter((u: any) => u.role === 'coordinator').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Events with Registrations</span>
                <span className="font-bold text-gray-900">
                  {events?.filter((e: any) => e.registeredCount > 0).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
