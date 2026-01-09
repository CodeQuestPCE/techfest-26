'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import AmbassadorLeaderboard from '@/components/AmbassadorLeaderboard';
import { ambassadorService } from '@/services/ambassadorService';
import { LogOut, Home, Copy, Award, Users, TrendingUp, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';
import MobileMenu from '@/components/MobileMenu';

export default function AmbassadorDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();

  const { data: stats, refetch: refetchStats } = useQuery<any>({
    queryKey: ['ambassador-stats'],
    queryFn: ambassadorService.getAmbassadorStats,
    enabled: isAuthenticated() && user?.role === 'ambassador',
  });

  // Auto-generate referral code if not present
  const { mutate: generateCode, isPending: isGenerating } = useMutation({
    mutationFn: ambassadorService.generateReferralCode,
    onSuccess: (response) => {
      const newCode = response.data.referralCode;
      // Update user in auth store with new referral code
      if (user) {
        updateUser({ ...user, referralCode: newCode });
      }
      toast.success('Referral code generated successfully!');
      refetchStats();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate referral code');
    },
  });

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== 'ambassador') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Auto-generate referral code on first visit if not present
  useEffect(() => {
    if (isAuthenticated() && user?.role === 'ambassador' && !user?.referralCode && !isGenerating) {
      generateCode();
    }
  }, [user?.referralCode, user?.role, isAuthenticated, isGenerating]);

  if (!isAuthenticated() || user?.role !== 'ambassador') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCopyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const statsData = stats?.data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Star className="w-8 h-8 text-purple-600" />
            EventHub Ambassador
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Home className="w-4 h-4" />
              My Dashboard
            </Link>
            <Link href="/admin/scanner" className="text-gray-700 hover:text-primary-600 font-medium">
              Scanner
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          <MobileMenu
            isAuthenticated={isAuthenticated()}
            userRole={user?.role}
            onLogout={handleLogout}
          />
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Campus Ambassador Dashboard ⭐
            </h1>
            <p className="text-white/90 text-lg">Track your referrals and climb the leaderboard!</p>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-8 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-7 h-7" />
              Your Referral Code
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
                  <code className="text-3xl font-mono font-bold tracking-wider">
                    {isGenerating ? 'Generating...' : (user?.referralCode || 'Loading...')}
                  </code>
                </div>
              </div>
              <button
                onClick={handleCopyReferralCode}
                className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Copy Code
              </button>
            </div>
            <p className="mt-4 text-white/90 text-lg">
              🎯 Share this code with students. Earn <span className="font-bold text-yellow-300">10 points</span> for each verified registration!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{statsData?.points || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Total Points 🏆</div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{statsData?.referredUsers || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Referrals 👥</div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-xl hover:shadow-2xl p-8 hover:-translate-y-2 transition-all duration-300 overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-white/30">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-4xl font-bold">#{statsData?.rank || '-'}</div>
                <div className="text-sm text-white/90 font-medium">Your Rank 🚀</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-7 h-7 text-purple-600" />
            Top Ambassadors Leaderboard
          </h2>
          <AmbassadorLeaderboard />
        </div>
      </div>
    </div>
  );
}
