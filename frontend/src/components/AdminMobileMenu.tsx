'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, CreditCard, Calendar, Users, UserCircle, BarChart3, FileText, QrCode, Settings, Home, LogOut } from 'lucide-react';

interface AdminMobileMenuProps {
  currentPath?: string;
  onLogout: () => void;
}

export default function AdminMobileMenu({ currentPath, onLogout }: AdminMobileMenuProps) {
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

  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Payments', icon: CreditCard },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/registrations', label: 'Registrations', icon: UserCircle },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/logs', label: 'Logs', icon: FileText },
    { href: '/admin/scanner', label: 'Scanner', icon: QrCode },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-6 h-6" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
            <button
              onClick={closeMenu}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close menu"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200" />

            {/* Additional Actions */}
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span>User Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                type="button"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
