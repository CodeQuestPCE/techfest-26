'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { eventService } from '@/services/eventService';
import { useAuthStore } from '@/store/authStore';
import { Calendar, MapPin, Users, IndianRupee, Search, Sparkles, TrendingUp, Zap, LogOut, Home } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export default function EventsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', searchTerm, categoryFilter],
    queryFn: () => eventService.getEvents({ search: searchTerm, category: categoryFilter }),
  });

  const categories = [
    'technical', 'cultural', 'workshop', 'seminar', 'conference', 
    'competition', 'hackathon', 'sports', 'gaming', 'festival', 
    'concert', 'exhibition', 'meetup', 'networking', 'training', 
    'debate', 'quiz', 'dance', 'art-design', 'other'
  ];

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

  const getCategoryColor = (category: string) => {
    const colors: any = {
      'technical': 'from-blue-500 to-cyan-500',
      'cultural': 'from-purple-500 to-pink-500',
      'sports': 'from-green-500 to-emerald-500',
      'workshop': 'from-orange-500 to-yellow-500',
      'competition': 'from-red-500 to-rose-500',
      'seminar': 'from-indigo-500 to-blue-500',
      'hackathon': 'from-violet-500 to-purple-600',
      'conference': 'from-slate-500 to-gray-600',
      'gaming': 'from-pink-500 to-rose-500',
      'debate': 'from-amber-500 to-orange-600',
      'quiz': 'from-teal-500 to-cyan-600',
      'dance': 'from-fuchsia-500 to-pink-600',
      'art-design': 'from-rose-500 to-pink-500',
      'festival': 'from-yellow-500 to-amber-500',
      'concert': 'from-purple-600 to-violet-600',
      'exhibition': 'from-emerald-500 to-teal-500',
      'meetup': 'from-blue-400 to-indigo-500',
      'networking': 'from-cyan-500 to-blue-600',
      'training': 'from-green-600 to-emerald-600',
      'other': 'from-gray-500 to-gray-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

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
            {isMounted && isAuthenticated() ? (
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <MobileMenu 
            isAuthenticated={isAuthenticated()}
            userRole={user?.role}
            onLogout={handleLogout}
          />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 px-4">
            Discover <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Amazing</span> Events
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">🎉 Join thousands of students in exciting tech events & competitions</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
              <input
                type="text"
                placeholder="Search for events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 sm:pl-14 pr-4 py-3 sm:py-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-lg text-base sm:text-lg"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-lg text-base sm:text-lg font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryDisplayName(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading amazing events...</p>
          </div>
        ) : events?.data?.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl shadow-xl mx-4">
            <Calendar className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-gray-600 text-lg sm:text-xl px-4">No events found. Try a different search! 🔍</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events?.data?.map((event: any, index: number) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Header */}
                <div className={`h-40 sm:h-48 bg-gradient-to-br ${getCategoryColor(event.category)} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all"></div>
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-start justify-between">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-xs sm:text-sm font-bold shadow-lg capitalize">
                      {getCategoryDisplayName(event.category)}
                    </span>
                    {event.registrationFee > 0 && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1">
                        <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                        {event.registrationFee}
                      </span>
                    )}
                    {event.registrationFee === 0 && (
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        FREE ✨
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-2 sm:space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">
                        {event.registeredCount || 0}/{event.capacity} Registered
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((event.registeredCount || 0) / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      event.eventType === 'team' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {event.eventType === 'team' ? '👥 Team' : '👤 Solo'}
                    </span>
                    <span className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-3 transition-all">
                      Register Now
                      <TrendingUp className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 to-pink-400/20"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
