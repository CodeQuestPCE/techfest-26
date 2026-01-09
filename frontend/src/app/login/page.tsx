'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Sparkles, Home, LogOut } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated()) {
      if (user?.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (user?.role === 'ambassador') {
        router.replace('/ambassador/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data.email, data.password);
      
      setAuth(response.user, response.token);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (response.user.role === 'ambassador') {
        router.push('/ambassador/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          <div className="hidden lg:flex gap-4">
            {mounted && isAuthenticated() ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user?.role === 'ambassador' && (
                  <Link
                    href="/ambassador/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    Ambassador
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                {(user?.role === 'admin' || user?.role === 'coordinator') && (
                  <Link
                    href="/create-event"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    Create Event
                  </Link>
                )}
                {(user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'ambassador') && (
                  <Link
                    href="/admin/scanner"
                    className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
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
              </>
            ) : (
              <>
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
        </div>
      </nav>

      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 sm:mb-6 transform hover:rotate-12 transition-transform">
            <span className="text-2xl sm:text-3xl font-bold text-white">E</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Welcome Back! 👋
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700">
              Sign up free
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="you@college.edu"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm sm:text-base text-gray-700">
                  Remember me
                </label>
              </div>

              <Link href="/forgot-password" className="text-sm sm:text-base font-medium text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2">
            ← Back to home
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
