'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import AdminDashboard from '@/components/AdminDashboard';
import AdminMobileMenu from '@/components/AdminMobileMenu';
import { LogOut, Home, Shield, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated() || user?.role !== 'admin')) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated() || user?.role !== 'admin') {
    return null;
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
          <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span className="hidden sm:inline">EventHub Admin</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-primary-600 font-medium">
              Payments
            </Link>
            <Link href="/admin/events" className="text-gray-700 hover:text-primary-600">
              Events
            </Link>
            <Link href="/admin/users" className="text-gray-700 hover:text-primary-600">
              Users
            </Link>
            <Link href="/admin/registrations" className="text-gray-700 hover:text-primary-600">
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
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <AdminMobileMenu currentPath="/admin/dashboard" onLogout={handleLogout} />
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2">
                Admin Dashboard 🎯
              </h1>
              <p className="text-white/90 text-sm sm:text-base md:text-lg">Welcome back, {user?.name}! Manage payments and verify registrations</p>
            </div>
          </div>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
