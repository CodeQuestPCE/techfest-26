'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Award, TrendingUp, Sparkles, Zap, Trophy, Rocket, Star, Gift, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import MobileMenu from '@/components/MobileMenu';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4">
            {isAuthenticated() ? (
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
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-100 rounded-full mb-6 animate-bounce text-xs sm:text-sm">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="text-purple-700 font-semibold">Join 10,000+ Students Already Registered!</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight px-4">
            Your Campus Events,
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"> Supercharged</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 sm:mb-10 leading-relaxed px-4">
            🚀 Discover amazing tech events • 🏆 Win prizes • 🎓 Get certified • 💫 Earn rewards
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4">
            <Link
              href="/events"
              className="group px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-2xl transform hover:scale-105 transition-all text-base sm:text-lg font-bold flex items-center gap-2"
            >
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" />
              Explore Events
            </Link>
            <Link
              href="/register"
              className="px-6 sm:px-10 py-3 sm:py-5 border-3 border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transform hover:scale-105 transition-all text-base sm:text-lg font-bold flex items-center gap-2"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Register Now
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-6 px-4">✨ No credit card required • Free to join</p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-4">
            Why Students <span className="text-purple-600">Love</span> Us? 💜
          </h2>
          <p className="text-base sm:text-xl text-gray-600 px-4">Everything you need for an amazing event experience</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="group text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-purple-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-12 transition-transform">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Quick Registration
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Register in 2 minutes with simple UPI/bank payment. No hassle!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-blue-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-12 transition-transform">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Solo or Team
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Join solo or bring your squad. Team up with friends for epic wins!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-yellow-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-12 transition-transform">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Win Prizes
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Compete for amazing prizes, certificates & bragging rights!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-green-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-12 transition-transform">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Earn Rewards
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Become an ambassador, refer friends & earn awesome rewards!
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">10K+</div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg">Active Students</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg">Events Hosted</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">50+</div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg">Partner Colleges</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">₹10L+</div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg">Prize Money</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 -translate-x-48"></div>
          <div className="relative z-10">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 px-4">Ready to Join the Fun? 🎉</h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 opacity-95 max-w-2xl mx-auto px-4">
              Create your free account and start exploring amazing events today!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-6 bg-white text-purple-600 rounded-full hover:bg-gray-100 text-lg sm:text-xl font-bold shadow-xl transform hover:scale-105 transition-all"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Create Free Account
            </Link>
            <p className="text-xs sm:text-sm mt-6 opacity-80">🔥 Join 100+ students who signed up today!</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span className="text-2xl font-bold">EventHub</span>
              </div>
              <p className="text-gray-400">Making campus events awesome for students</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/events" className="block text-gray-400 hover:text-white transition-colors">Browse Events</Link>
                <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/ambassador/dashboard" className="block text-gray-400 hover:text-white transition-colors">Become Ambassador</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">FAQs</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">f</a>
                <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">t</a>
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">in</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 EventHub. Made with 💜 for students</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
