'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Calendar, Search, Edit, Trash2, Plus, Home, LogOut, Users, MapPin, IndianRupee, Sparkles, Shield } from 'lucide-react';
import AdminMobileMenu from '@/components/AdminMobileMenu';

export default function AdminEventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryDisplayName = (category: string) => {
    const names: any = {
      'technical': 'Technical',
      'cultural': 'Cultural',
      'workshop': 'Workshop',
      'seminar': 'Seminar',
      'conference': 'Conference',
      'competition': 'Competition',
      'hackathon': 'Hackathon',
      'sports': 'Sports',
      'gaming': 'Gaming/E-Sports',
      'festival': 'Festival',
      'concert': 'Concert',
      'exhibition': 'Exhibition',
      'meetup': 'Meetup',
      'networking': 'Networking',
      'training': 'Training',
      'debate': 'Debate',
      'quiz': 'Quiz',
      'dance': 'Dance',
      'art-design': 'Art & Design',
      'other': 'Other'
    };
    return names[category] || category;
  };

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data.data;
    },
    enabled: isAuthenticated() && user?.role === 'admin',
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    },
  });

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This will also delete all registrations for this event.`)) {
      deleteEventMutation.mutate(eventId);
    }
  };

  if (!isAuthenticated() || user?.role !== 'admin') {
    return null;
  }

  const filteredEvents = events?.filter((e: any) =>
    !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Link href="/admin/events" className="text-purple-600 font-semibold">
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
            <Link href="/admin/logs" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Logs
            </Link>
            <Link href="/admin/scanner" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Scanner
            </Link>
            <Link href="/admin/settings" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Settings
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
          <AdminMobileMenu currentPath="/admin/events" onLogout={() => { logout(); router.push('/'); }} />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Event Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all events and registrations</p>
          </div>
          <Link
            href="/create-event"
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium mb-2">Search Events</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by event name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents?.map((event: any) => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Calendar className="w-20 h-20 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {event.location?.venue || 'TBA'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {event.registeredCount}/{event.capacity} registered
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IndianRupee className="w-4 h-4" />
                        ₹{event.registrationFee || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        event.eventType === 'team' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.eventType === 'team' ? 'Team Event' : 'Solo Event'}
                      </span>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 capitalize">
                        {getCategoryDisplayName(event.category)}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex-1 px-4 py-2 text-center border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => router.push(`/admin/events/${event._id}/edit`)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.title)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents?.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No events found</p>
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Event
                </Link>
              </div>
            )}
          </>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900">{events?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Solo Events</h3>
            <p className="text-3xl font-bold text-green-600">
              {events?.filter((e: any) => e.eventType === 'solo').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Team Events</h3>
            <p className="text-3xl font-bold text-blue-600">
              {events?.filter((e: any) => e.eventType === 'team').length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Registrations</h3>
            <p className="text-3xl font-bold text-purple-600">
              {events?.reduce((sum: number, e: any) => sum + (e.registeredCount || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
