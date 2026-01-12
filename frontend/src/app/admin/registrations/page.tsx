'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import AdminMobileMenu from '@/components/AdminMobileMenu';
import { Users, Search, Filter, Download, Home, LogOut, Calendar, CheckCircle, Clock, XCircle, Shield, Sparkles, X } from 'lucide-react';

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [checkInFilter, setCheckInFilter] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['admin-all-registrations'],
    queryFn: async () => {
      const response = await api.get('/admin/registrations');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const { data: events } = useQuery({
    queryKey: ['admin-events-list'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  if (!isAuthenticated() || user?.role !== 'admin') {
    return null;
  }

  const filteredRegistrations = registrations?.filter((reg: any) => {
    const matchesSearch = !searchTerm ||
      reg.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !statusFilter || reg.status === statusFilter;
    const matchesEvent = !eventFilter || (reg.event && reg.event._id === eventFilter);
    const matchesCheckIn = !checkInFilter || 
      (checkInFilter === 'checked-in' && reg.checkInStatus) ||
      (checkInFilter === 'not-checked-in' && !reg.checkInStatus);
    return matchesSearch && matchesStatus && matchesEvent && matchesCheckIn;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (!filteredRegistrations || filteredRegistrations.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Event', 'Type', 'Status', 'Amount', 'Date', 'UTR'];
    const rows = filteredRegistrations.map((reg: any) => [
      reg.user?.name || '',
      reg.user?.email || '',
      reg.event?.title || '',
      reg.event?.eventType || '',
      reg.status || '',
      reg.totalAmount || 0,
      reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Recently',
      reg.utrNumber || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span className="hidden sm:inline">EventHub Admin</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-700 hover:text-primary-600">
              Payments
            </Link>
            <Link href="/admin/events" className="text-gray-700 hover:text-primary-600">
              Events
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-primary-600">
              Users
            </Link>
            <Link href="/admin/registrations" className="text-primary-600 font-medium">
              Registrations
            </Link>
            <Link href="/admin/analytics" className="text-gray-700 hover:text-primary-600">
              Analytics
            </Link>
            <Link href="/admin/logs" className="text-gray-700 hover:text-primary-600">
              Logs
            </Link>
            <Link href="/admin/scanner" className="text-gray-700 hover:text-primary-600">
              Scanner
            </Link>
            <Link href="/admin/settings" className="text-gray-700 hover:text-primary-600">
              Settings
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <AdminMobileMenu currentPath="/admin/registrations" onLogout={() => { logout(); router.push('/'); }} />
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              All Registrations
            </h1>
            <p className="text-gray-600 mt-2">View and manage all event registrations</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, event..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Event</label>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Events</option>
                {events?.map((event: any) => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
              <select
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="checked-in">Checked In</option>
                <option value="not-checked-in">Not Checked In</option>
              </select>
            </div>          </div>
        </div>

        {/* Registrations Table */}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-in</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRegistrations?.map((reg: any) => (
                      <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{reg.user?.name}</div>
                          <div className="text-sm text-gray-500">{reg.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{reg.event ? reg.event.title : <span className="text-red-500">[Event Deleted]</span>}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setShowDetailsModal(true);
                          }}
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-transform ${reg.event?.eventType === 'team' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                        >
                          {reg.event ? (reg.event.eventType === 'team' ? '👥 Team' : '👤 Solo') : '[Event Deleted]'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(reg.status)}
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                            {reg.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {reg.checkInStatus ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <div>
                              <div className="font-medium text-sm">Checked in</div>
                              <div className="text-xs text-gray-500">
                                {new Date(reg.checkInTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Not checked in</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">₹{reg.totalAmount}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Recently'}
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredRegistrations?.map((reg: any) => (
                  <div key={reg._id} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{reg.user?.name}</div>
                          <div className="text-sm text-gray-500">{reg.user?.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(reg.status)}
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                            {reg.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{reg.event ? reg.event.title : <span className="text-red-500">[Event Deleted]</span>}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setShowDetailsModal(true);
                            }}
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition-transform ${reg.event?.eventType === 'team' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                          >
                            {reg.event ? (reg.event.eventType === 'team' ? '👥 Team' : '👤 Solo') : '[Event Deleted]'}
                          </button>
                        </div>
                      </div>

                      {reg.checkInStatus ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Checked in</div>
                            <div className="text-xs text-gray-500">
                              {new Date(reg.checkInTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <XCircle className="w-4 h-4" />
                          <span>Not checked in</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          ₹{reg.totalAmount || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRegistrations?.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No registrations found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total</h3>
            <p className="text-3xl font-bold text-gray-900">{registrations?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Verified</h3>
            <p className="text-3xl font-bold text-green-600">
              {registrations?.filter((r: any) => r.status === 'verified').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {registrations?.filter((r: any) => r.status === 'pending').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Checked In</h3>
            <p className="text-3xl font-bold text-blue-600">
              {registrations?.filter((r: any) => r.checkInStatus).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">
              ₹{registrations?.filter((r: any) => r.status === 'verified')
                .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {selectedRegistration.event ? (selectedRegistration.event.eventType === 'team' ? '👥 Team Details' : '👤 Participant Details') : '[Event Deleted]'}
                </h3>
                <p className="text-purple-100 text-sm mt-1">{selectedRegistration.event ? selectedRegistration.event.title : <span className="text-red-200">[Event Deleted]</span>}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedRegistration.event?.eventType === 'team' ? (
                <>
                  {/* Team Name */}
                  {selectedRegistration.teamName && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-blue-700 font-semibold mb-1">Team Name</p>
                      <p className="text-xl font-bold text-gray-900">{selectedRegistration.teamName}</p>
                    </div>
                  )}

                  {/* Team Leader */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center">👑</span>
                      Team Leader
                    </h4>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-300">
                      <p className="font-bold text-gray-900 text-lg mb-2">{selectedRegistration.user?.name}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">📧 {selectedRegistration.user?.email}</p>
                        <p className="text-gray-600">📱 {selectedRegistration.user?.phone}</p>
                        {selectedRegistration.user?.college && (
                          <p className="text-gray-600">🏫 {selectedRegistration.user?.college}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  {selectedRegistration.teamMembers && selectedRegistration.teamMembers.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        Other Team Members ({selectedRegistration.teamMembers.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedRegistration.teamMembers.map((member: any, idx: number) => (
                          <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 2}
                              </span>
                              <p className="font-bold text-gray-900">{member.name}</p>
                            </div>
                            <div className="ml-9 space-y-1 text-sm">
                              <p className="text-gray-600">📧 {member.email}</p>
                              <p className="text-gray-600">📱 {member.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Solo Participant */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">👤</span>
                      Participant Information
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300">
                      <p className="font-bold text-gray-900 text-lg mb-2">{selectedRegistration.user?.name}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">📧 {selectedRegistration.user?.email}</p>
                        <p className="text-gray-600">📱 {selectedRegistration.user?.phone}</p>
                        {selectedRegistration.user?.college && (
                          <p className="text-gray-600">🏫 {selectedRegistration.user?.college}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Registration Info */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Registration Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRegistration.status)}`}>
                      {selectedRegistration.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-gray-900">₹{selectedRegistration.totalAmount}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Ticket Type</p>
                    <p className="font-semibold text-gray-900">{selectedRegistration.ticketType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Check-in Status</p>
                    <p className={`font-semibold ${selectedRegistration.checkInStatus ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedRegistration.checkInStatus ? '✅ Checked in' : '⏳ Not checked in'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
