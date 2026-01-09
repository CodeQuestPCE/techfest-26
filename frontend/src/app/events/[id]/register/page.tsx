'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { useAuthStore } from '@/store/authStore';
import ManualPaymentForm from '@/components/ManualPaymentForm';
import { Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export default function EventRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const eventId = params.id as string;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEvent(eventId),
    enabled: isAuthenticated(),
  });

  // Redirect if not authenticated
  if (!isAuthenticated()) {
    router.push(`/login?redirect=/events/${eventId}/register`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  const eventData = event?.data;

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Event not found</h2>
          <Link href="/events" className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Browse Events
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Dashboard
            </Link>
            {user?.role === 'ambassador' && (
              <Link href="/ambassador/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Ambassador
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Admin Panel
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'coordinator') && (
              <Link href="/create-event" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Create Event
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Navigation */}6 sm:py-8 max-w-4xl">
        <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 mb-4 sm:mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to event
        </Link>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3">Register for Event</h1>
          <h2 className="text-lg sm:text-xl text-gray-600 mb-6 sm:
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 mb-6 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to event
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">Register for Event</h1>
          <h2 className="text-xl text-gray-600 mb-8 font-medium">{eventData.title}</h2>

          <ManualPaymentForm event={eventData} />
        </div>
      </div>
    </div>
  );
}
