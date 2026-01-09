'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { useAuthStore } from '@/store/authStore';
import { Calendar, MapPin, Users, IndianRupee, Clock, Award, FileText, Sparkles, LogOut, Home, ArrowLeft } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const eventId = params.id as string;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBA';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'TBA';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBA';
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'TBA';
    }
  };

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      try {
        const result = await eventService.getEvent(eventId);
        console.log('Event data fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching event:', err);
        throw err;
      }
    },
    retry: 1,
  });

  const handleRegister = () => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=/events/${eventId}/register`);
    } else {
      router.push(`/events/${eventId}/register`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error loading event</h2>
          <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'Failed to load event'}</p>
          <Link href="/events" className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to events
          </Link>
        </div>
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

  const isEventFull = eventData.registeredCount >= eventData.capacity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`px-4 py-2 font-medium transition-colors ${
                pathname.startsWith('/events') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Events
            </Link>
            {isAuthenticated() ? (
              <>
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
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
          {/* Mobile Menu */}
          <MobileMenu
            isAuthenticated={isAuthenticated()}
            userRole={user?.role}
            onLogout={handleLogout}
          />
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/events" className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 mb-4 sm:mb-6 font-semibold transition-colors text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to events
        </Link>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="h-48 sm:h-64 md:h-72 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <Calendar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white relative z-10" />
          </div>

          <div className="p-6 sm:p-8 md:p-12">
            {/* Title and Category */}
            <div className="flex flex-col lg:flex-row items-start justify-between mb-6 sm:mb-8 gap-4 sm:gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs sm:text-sm font-semibold capitalize">
                    {getCategoryDisplayName(eventData.category)}
                  </span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                    {eventData.eventType === 'team' ? '👥 Team Event' : '👤 Solo Event'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{eventData.title}</h1>
              </div>
              <div className="w-full lg:w-auto text-left lg:text-right bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹{eventData.registrationFee}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Registration Fee</div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Date</div>
                  <div className="font-semibold text-sm sm:text-base">{formatDate(eventData.startDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Time</div>
                  <div className="font-semibold text-sm sm:text-base">{formatTime(eventData.startDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Venue</div>
                  <div className="font-semibold text-sm sm:text-base truncate">{eventData.location?.venue || eventData.venue || 'TBA'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Capacity</div>
                  <div className="font-semibold text-sm sm:text-base">
                    {eventData.registeredCount || 0} / {eventData.capacity}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About this event</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{eventData.description}</p>
            </div>

            {/* Rules */}
            {eventData.rules && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  Rules & Guidelines
                </h2>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{eventData.rules}</p>
                </div>
              </div>
            )}

            {/* Team Info */}
            {eventData.eventType === 'team' && (
              <div className="mb-6 sm:mb-8 bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Team Event Information</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  This is a team event. Team size: {eventData.minTeamSize} - {eventData.maxTeamSize} members
                </p>
              </div>
            )}

            {/* Prizes */}
            {eventData.prizes && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  Prizes
                </h2>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-lg">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{eventData.prizes}</p>
                </div>
              </div>
            )}

            {/* Registration Button */}
            <div className="border-t pt-4 sm:pt-6">
              {isEventFull ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 sm:py-4 text-base sm:text-lg rounded-lg font-semibold cursor-not-allowed"
                >
                  Event Full
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full bg-primary-600 text-white py-3 sm:py-4 text-base sm:text-lg rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
