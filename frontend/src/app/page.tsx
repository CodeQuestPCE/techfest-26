'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, Award, TrendingUp, Sparkles, Zap, Trophy, Rocket, Star, Gift, Home, LogOut, MapPin, IndianRupee, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import MobileMenu from '@/components/MobileMenu';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cursor tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-x-hidden w-full">
      {/* Enhanced Magical Cursor Effect with trail */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.12), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none fixed w-8 h-8 rounded-full border-2 border-purple-400 z-50 transition-transform duration-150 ease-out mix-blend-difference"
        style={{
          left: `${mousePosition.x - 16}px`,
          top: `${mousePosition.y - 16}px`,
          transform: cursorVariant === 'hover' ? 'scale(1.5)' : 'scale(1)',
        }}
      />
      
      {/* Enhanced Animated Particles with more variety */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[25%] left-[25%] w-2 h-2 bg-purple-400 rounded-full animate-float shadow-lg shadow-purple-400/50"></div>
        <div className="absolute top-[33%] right-[25%] w-3 h-3 bg-pink-400 rounded-full animate-float-delayed shadow-lg shadow-pink-400/50"></div>
        <div className="absolute bottom-[25%] left-[33%] w-2 h-2 bg-blue-400 rounded-full animate-float-slow shadow-lg shadow-blue-400/50"></div>
        <div className="absolute top-[66%] right-[33%] w-2 h-2 bg-purple-300 rounded-full animate-float shadow-lg shadow-purple-300/50"></div>
        <div className="absolute bottom-[33%] right-[25%] w-3 h-3 bg-pink-300 rounded-full animate-float-delayed shadow-lg shadow-pink-300/50"></div>
        <div className="absolute top-[50%] left-[50%] w-4 h-4 bg-blue-300 rounded-full animate-float-slow shadow-lg shadow-blue-300/50"></div>
        <div className="absolute top-[75%] left-[25%] w-2 h-2 bg-yellow-400 rounded-full animate-float shadow-lg shadow-yellow-400/50"></div>
        <div className="absolute bottom-[50%] right-[50%] w-3 h-3 bg-green-400 rounded-full animate-float-delayed shadow-lg shadow-green-400/50"></div>
      </div>

      {/* Parallax Background Grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          backgroundImage: 'radial-gradient(circle, #9333ea 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 backdrop-blur-md bg-white/70 sticky top-0 z-50 rounded-b-2xl shadow-xl border-b border-white/20 animate-slide-down">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 hover:scale-105 transition-transform group">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-pulse group-hover:rotate-180 transition-transform duration-500" />
            <span className="group-hover:tracking-wider transition-all duration-300">EventHub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4">
            {isAuthenticated() ? (
              <>
                <Link
                  href="/events"
                  className={`px-4 py-2 font-medium transition-colors ${
                    pathname.startsWith('/events') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Events
                </Link>
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
                  href="/events"
                  className={`px-4 py-2 font-medium transition-colors ${
                    pathname.startsWith('/events') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  Events
                </Link>
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
      <section className="container mx-auto px-4 py-12 sm:py-20 relative overflow-hidden z-10" data-animate id="hero">
        {/* Enhanced Animated Background Elements with parallax */}
        <div 
          className="absolute top-20 left-10 w-64 sm:w-72 h-64 sm:h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-40 right-10 w-64 sm:w-72 h-64 sm:h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div 
          className="absolute -bottom-8 left-20 sm:left-40 w-64 sm:w-72 h-64 sm:h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        ></div>
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-10 right-10 sm:right-20 animate-bounce-slow">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl rotate-12 opacity-20 animate-spin-slow"></div>
        </div>
        <div className="absolute bottom-20 left-10 animate-spin-slow">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
        </div>
        <div className="absolute top-1/2 right-10 animate-float">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg rotate-45 opacity-20"></div>
        </div>
        
        <div className={`text-center max-w-5xl mx-auto relative z-10 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6 animate-bounce-gentle backdrop-blur-sm border border-purple-200 text-xs sm:text-sm hover:scale-105 hover:shadow-lg transition-all cursor-pointer group">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin-slow group-hover:animate-bounce" />
            <span className="text-purple-700 font-semibold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text">Join 10,000+ Students Already Registered!</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin-slow group-hover:animate-bounce" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight px-4 animate-fade-in-up">
            Your Campus Events,
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient inline-block hover:scale-105 transition-transform"> Supercharged</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 sm:mb-10 leading-relaxed px-4 animate-fade-in-up animation-delay-200">
            🚀 Discover amazing tech events • 🏆 Win prizes • 🎓 Get certified • 💫 Earn rewards
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/events"
              className="group px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 text-base sm:text-lg font-bold flex items-center gap-2 relative overflow-hidden magnetic-button"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce group-hover:rotate-45 transition-transform duration-300 relative z-10" />
              <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">Explore Events</span>
            </Link>
            <Link
              href="/register"
              className="group px-6 sm:px-10 py-3 sm:py-5 border-3 border-purple-600 text-purple-600 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 text-base sm:text-lg font-bold flex items-center gap-2 magnetic-button"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse group-hover:rotate-12 transition-transform duration-300" />
              <span className="group-hover:tracking-wider transition-all duration-300">Register Now</span>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-6 px-4 animate-fade-in-up animation-delay-600 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            ✨ No credit card required • Free to join
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-20 relative z-10" data-animate id="features">
        <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-4 animate-fade-in">
            Why Students <span className="text-purple-600 animate-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent inline-block hover:scale-110 transition-transform">Love</span> Us? 💜
          </h2>
          <p className="text-base sm:text-xl text-gray-600 px-4">Everything you need for an amazing event experience</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="group text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-purple-300 cursor-pointer relative overflow-hidden tilt-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 shadow-lg relative z-10">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-purple-600 transition-colors">
              Quick Registration
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative z-10">
              Register in 2 minutes with simple UPI/bank payment. No hassle!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-blue-300 cursor-pointer relative overflow-hidden tilt-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 shadow-lg relative z-10">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-blue-600 transition-colors">
              Solo or Team
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative z-10">
              Join solo or bring your squad. Team up with friends for epic wins!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-yellow-300 cursor-pointer relative overflow-hidden tilt-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 shadow-lg relative z-10">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-yellow-600 transition-colors">
              Win Prizes
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative z-10">
              Compete for amazing prizes, certificates & bragging rights!
            </p>
          </div>
          <div className="group text-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-green-300 cursor-pointer relative overflow-hidden tilt-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 shadow-lg relative z-10">
              <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 relative z-10 group-hover:text-green-600 transition-colors">
              Earn Rewards
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative z-10">
              Become an ambassador, refer friends & earn awesome rewards!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <FeaturedEventsSection 
        isVisible={isVisible}
        setCursorVariant={setCursorVariant}
      />

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 relative" data-animate id="stats">
        {/* Floating decorative elements */}
        <div className="absolute top-0 left-10 w-20 h-20 bg-purple-300/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-300/20 rounded-full animate-float-delayed blur-xl"></div>
        
        <div className={`bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat animate-shimmer" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
            }}></div>
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute top-10 right-20 animate-pulse">
            <Sparkles className="w-8 h-8 text-white/30" />
          </div>
          <div className="absolute bottom-10 left-20 animate-pulse animation-delay-400">
            <Star className="w-6 h-6 text-white/20" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center relative z-10">
            <div className="group transform hover:scale-125 transition-all duration-500 cursor-pointer p-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 animate-bounce-gentle group-hover:text-yellow-300 transition-colors relative z-10">
                  10K+
                </div>
              </div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg group-hover:text-white group-hover:font-semibold transition-all">
                <Users className="w-5 h-5 mx-auto mb-1 group-hover:animate-wiggle" />
                Active Students
              </div>
            </div>
            <div className="group transform hover:scale-125 transition-all duration-500 cursor-pointer p-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm animation-delay-200"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 animate-bounce-gentle group-hover:text-yellow-300 transition-colors relative z-10">
                  500+
                </div>
              </div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg group-hover:text-white group-hover:font-semibold transition-all">
                <Calendar className="w-5 h-5 mx-auto mb-1 group-hover:animate-wiggle" />
                Events Hosted
              </div>
            </div>
            <div className="group transform hover:scale-125 transition-all duration-500 cursor-pointer p-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm animation-delay-400"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 animate-bounce-gentle group-hover:text-yellow-300 transition-colors relative z-10">
                  50+
                </div>
              </div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg group-hover:text-white group-hover:font-semibold transition-all">
                <Award className="w-5 h-5 mx-auto mb-1 group-hover:animate-wiggle" />
                Partner Colleges
              </div>
            </div>
            <div className="group transform hover:scale-125 transition-all duration-500 cursor-pointer p-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm animation-delay-600"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 animate-bounce-gentle group-hover:text-yellow-300 transition-colors relative z-10">
                  ₹10L+
                </div>
              </div>
              <div className="text-purple-100 text-sm sm:text-base lg:text-lg group-hover:text-white group-hover:font-semibold transition-all">
                <Trophy className="w-5 h-5 mx-auto mb-1 group-hover:animate-wiggle" />
                Prize Money
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20" data-animate id="cta">
        <div className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 sm:p-16 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-1000 ${isVisible.cta ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Animated background circles */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -translate-y-24 sm:-translate-y-32 translate-x-24 sm:translate-x-32 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/10 rounded-full translate-y-32 sm:translate-y-48 -translate-x-32 sm:-translate-x-48 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 w-32 sm:w-40 h-32 sm:h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          
          {/* Floating sparkles */}
          <div className="absolute top-20 left-10 animate-bounce-slow">
            <Star className="w-6 h-6 text-white/40" />
          </div>
          <div className="absolute top-10 right-1/4 animate-float">
            <Sparkles className="w-8 h-8 text-white/30" />
          </div>
          <div className="absolute bottom-20 right-10 animate-bounce-gentle">
            <Trophy className="w-7 h-7 text-white/40" />
          </div>
          <div className="absolute bottom-10 left-1/4 animate-float-delayed">
            <Award className="w-6 h-6 text-white/30" />
          </div>
          
          <div className="relative z-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl animate-pulse"></div>
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 animate-spin-slow relative z-10" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 px-4 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
              Ready to Join the Fun? 🎉
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 opacity-95 max-w-2xl mx-auto px-4 animate-fade-in-up animation-delay-200">
              Create your free account and start exploring amazing events today!
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-6 bg-white text-purple-600 rounded-full hover:bg-gray-100 text-lg sm:text-xl font-bold shadow-xl transform hover:scale-110 transition-all animate-fade-in-up animation-delay-400 magnetic-button relative overflow-hidden"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">Create Free Account</span>
            </Link>
            <p className="text-xs sm:text-sm mt-6 opacity-80 animate-bounce-gentle flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              🔥 Join 100+ students who signed up today!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16 relative overflow-hidden z-20" data-animate id="footer">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className={`container mx-auto px-4 relative z-10 transition-all duration-1000 ${isVisible.footer ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Section */}
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 mb-4 group cursor-pointer">
                <Sparkles className="w-7 h-7 text-purple-400 group-hover:rotate-180 group-hover:scale-125 transition-all duration-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:tracking-wider transition-all duration-300">EventHub</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Your ultimate platform for discovering and managing campus events. Connect, participate, and make memories! 🎉
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>PCE Purnea, Bihar</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="animate-fade-in-up animation-delay-200">
              <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Quick Links
                </span>
              </h4>
              <div className="space-y-3">
                <Link href="/events" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Browse Events
                </Link>
                <Link href="/dashboard" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  My Dashboard
                </Link>
                <Link href="/create-event" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Create Event
                </Link>
                <Link href="/ambassador/dashboard" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Ambassador Program
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="animate-fade-in-up animation-delay-400">
              <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Event Categories
                </span>
              </h4>
              <div className="space-y-3">
                <Link href="/events?category=technical" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Technical Events
                </Link>
                <Link href="/events?category=cultural" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Cultural Events
                </Link>
                <Link href="/events?category=workshop" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Workshops
                </Link>
                <Link href="/events?category=competition" className="group flex items-center gap-2 text-gray-300 hover:text-white hover:translate-x-2 transition-all">
                  <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Competitions
                </Link>
              </div>
            </div>

            {/* Connect */}
            <div className="animate-fade-in-up animation-delay-600">
              <h4 className="font-bold mb-4 text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-pink-400" />
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Stay Connected
                </span>
              </h4>
              <p className="text-gray-300 mb-4 text-sm">
                Follow us on social media for updates and announcements
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <a href="#" className="group w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="group w-11 h-11 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-sky-500/50">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="group w-11 h-11 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-pink-500/50">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="group w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-blue-600/50">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
              <div className="text-sm text-gray-400">
                <p>📧 support@eventhub.com</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm">
                © 2024-2026 EventHub. Made with 
                <span className="inline-block animate-pulse text-purple-400">💜</span> 
                by PCE Purnea TechFest Team
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Featured Events Section Component
function FeaturedEventsSection({ isVisible, setCursorVariant }: { 
  isVisible: { [key: string]: boolean }, 
  setCursorVariant: (variant: 'default' | 'hover') => void 
}) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventService.getEvents({}),
  });

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

  const featuredEvents = events?.data?.slice(0, 6) || [];

  return (
    <section className="container mx-auto px-4 py-12 sm:py-20 relative z-10" data-animate id="featured-events">
      <div className={`transition-all duration-1000 ${isVisible['featured-events'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6 animate-bounce-gentle backdrop-blur-sm border border-purple-200">
            <Trophy className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="text-purple-700 font-semibold text-sm sm:text-base">Featured Events</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 px-4">
            Upcoming <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Tech Events</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-600 px-4">Join exciting competitions, workshops & more!</p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredEvents.map((event: any, index: number) => {
              const isEventFull = event.registeredCount >= event.capacity;
              return (
                <Link
                  href={`/events/${event._id}`}
                  key={event._id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-300 relative"
                  onMouseEnter={() => setCursorVariant('hover')}
                  onMouseLeave={() => setCursorVariant('default')}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  
                  {/* Event Content */}
                  <div className="relative z-10 p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(event.category)} shadow-lg`}>
                        {getCategoryDisplayName(event.category)}
                      </span>
                      {isEventFull && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-red-500 shadow-lg">
                          Full
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Event Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        <span className="truncate">
                          {typeof event.location === 'string' 
                            ? event.location 
                            : event.location?.venue || event.location?.city || 'TBA'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>{event.registeredCount}/{event.capacity}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-green-600">
                          <IndianRupee className="w-4 h-4" />
                          <span>{event.registrationFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 group-hover:border-purple-300 transition-colors">
                      <span className="text-sm font-semibold text-purple-600 group-hover:text-pink-600 transition-colors">
                        View Details
                      </span>
                      <ArrowRight className="w-5 h-5 text-purple-600 group-hover:text-pink-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No events available at the moment</p>
          </div>
        )}

        {/* View All Events Button */}
        {featuredEvents.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 font-bold text-lg magnetic-button relative overflow-hidden"
              onMouseEnter={() => setCursorVariant('hover')}
              onMouseLeave={() => setCursorVariant('default')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">View All Events</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
