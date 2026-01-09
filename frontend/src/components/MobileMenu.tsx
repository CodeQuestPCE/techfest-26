'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  isAuthenticated: boolean;
  userRole?: string;
  onLogout: () => void;
}

export default function MobileMenu({ isAuthenticated, userRole, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-gray-700 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-colors relative z-50"
        aria-label="Toggle menu"
        type="button"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop Overlay - Higher z-index */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer - Highest z-index */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close menu"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/events"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                >
                  Events
                </Link>
                {userRole === 'ambassador' && (
                  <Link
                    href="/ambassador/dashboard"
                    onClick={closeMenu}
                    className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                  >
                    Ambassador
                  </Link>
                )}
                {userRole === 'admin' && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                    >
                      Admin Panel
                    </Link>
                    <Link
                      href="/admin/scanner"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                    >
                      Scanner
                    </Link>
                    <Link
                      href="/create-event"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                    >
                      Create Event
                    </Link>
                  </>
                )}
                
                {/* Divider */}
                <div className="my-2 border-t border-gray-200"></div>
                
                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                >
                  Events
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium"
                >
                  Login
                </Link>
                
                {/* Divider */}
                <div className="my-2 border-t border-gray-200"></div>
                
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
