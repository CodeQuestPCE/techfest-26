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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().min(2, 'College name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  referralCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      setAuth(response.user, response.token);
      toast.success('Registration successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Login
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
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Join <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">EventHub</span> 🚀
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Start your journey with us today!
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-purple-600 hover:text-pink-600 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name ✨
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address 📧
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Password 🔒
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="college" className="block text-sm font-semibold text-gray-700 mb-1">
                  College Name 🎓
                </label>
                <input
                  {...register('college')}
                  type="text"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Your College"
                />
                {errors.college && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.college.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number 📱
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-1">
                  Referral Code 🎁 <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  {...register('referralCode')}
                  type="text"
                  className="appearance-none relative block w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  placeholder="Enter ambassador code"
                />
                {errors.referralCode && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    ⚠️ {errors.referralCode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-base sm:text-lg font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account 🚀
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
