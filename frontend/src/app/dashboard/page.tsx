'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import MyRegistrations from '@/components/MyRegistrations';
import { Calendar, LogOut, User, Sparkles, TrendingUp, Award, Zap, Star } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Browse Events
            </Link>
            <Link href="/dashboard" className="text-purple-600 font-semibold">
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
            {(user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'ambassador') && (
              <Link href="/admin/scanner" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Scanner
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
          {/* Mobile Menu */}
          <MobileMenu
            isAuthenticated={isAuthenticated()}
            userRole={user?.role}
            onLogout={handleLogout}
          />
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section with Gradient */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-white/90 text-base sm:text-lg mb-3 break-all">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm text-purple-700 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  {user?.role?.toUpperCase()}
                </span>
                {user?.college && (
                  <span className="text-white/90 text-xs sm:text-sm font-medium flex items-center gap-2">
                    🎓 {user?.college}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions with Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link
            href="/events"
            className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl p-6 sm:p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Browse Events 🎯
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Discover and register for upcoming events</p>
            </div>
          </Link>

          {user?.role === 'ambassador' && (
            <Link
              href="/ambassador/dashboard"
              className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl p-6 sm:p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Ambassador Hub 🌟
                </h3>
                <p className="text-sm sm:text-base text-gray-600">View your referrals and points</p>
              </div>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl p-6 sm:p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  Admin Panel ⚡
                </h3>
                <p className="text-sm sm:text-base text-gray-600">Manage events and verify payments</p>
              </div>
            </Link>
          )}

          <Link
            href="/events"
            className="group relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl p-6 sm:p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform border-2 border-white/30">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Explore New 🚀
              </h3>
              <p className="text-sm sm:text-base text-white/90">Check out trending events</p>
            </div>
          </Link>
        </div>

        {/* My Registrations */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Registrations</h2>
          <MyRegistrations />
        </div>
      </div>
    </div>
  );
}
