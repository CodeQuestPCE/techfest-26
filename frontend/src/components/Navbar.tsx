'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  userRole?: string;
  userName?: string;
  onLogout: () => void;
  currentPath?: string;
}

export default function Navbar({ isAuthenticated, userRole, userName, onLogout, currentPath }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Build navigation items based on user role
  const getNavItems = () => {
    const items = [];

    if (isAuthenticated) {
      // Common items for all authenticated users
      items.push({ label: 'Home', href: '/', show: 'both' });
      items.push({ label: 'Browse Events', href: '/events', show: 'both' });
      items.push({ label: 'Dashboard', href: '/dashboard', show: 'both' });

      // Role-specific items
      if (userRole === 'ambassador') {
        items.push({ label: 'Ambassador Dashboard', href: '/ambassador/dashboard', show: 'both' });
      }

      if (userRole === 'coordinator' || userRole === 'admin') {
        items.push({ label: 'Create Event', href: '/create-event', show: 'both' });
        items.push({ label: 'QR Scanner', href: '/admin/scanner', show: 'both' });
      }

      if (userRole === 'admin') {
        items.push({ label: 'Payments', href: '/admin/dashboard', show: 'both' });
        items.push({ label: 'Registrations', href: '/admin/registrations', show: 'both' });
        items.push({ label: 'Users', href: '/admin/users', show: 'desktop' });
        items.push({ label: 'Manage Events', href: '/admin/events', show: 'both' });
        items.push({ label: 'Analytics', href: '/admin/analytics', show: 'desktop' });
        items.push({ label: 'Activity Logs', href: '/admin/logs', show: 'desktop' });
      }
    } else {
      items.push({ label: 'Home', href: '/', show: 'both' });
      items.push({ label: 'Browse Events', href: '/events', show: 'both' });
      items.push({ label: 'Login', href: '/login', show: 'both' });
      items.push({ label: 'Sign Up', href: '/register', show: 'both' });
    }

    return items;
  };

  const navItems = getNavItems();
  const desktopItems = navItems.filter(item => item.show === 'both' || item.show === 'desktop');
  const mobileItems = navItems;

  const isActiveLink = (href: string) => {
    return currentPath === href;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span className="hidden sm:inline">EventHub</span>
            <span className="sm:hidden">EH</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {desktopItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActiveLink(item.href)
                    ? 'text-purple-600 font-semibold'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-all z-[100]"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 h-screen w-[80vw] sm:w-[60vw] md:w-[50vw] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[95] lg:hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">EventHub</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && userName && (
              <div className="p-4 border-b bg-purple-50">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-purple-700">{userName}</p>
                {userRole && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                    {userRole}
                  </span>
                )}
              </div>
            )}

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col">
                {mobileItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-6 py-3 text-base font-medium transition-colors ${
                      isActiveLink(item.href)
                        ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile Menu Footer */}
            {isAuthenticated && (
              <div className="p-4 border-t">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
