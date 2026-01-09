'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

interface AdminMobileMenuProps {
  currentPath?: string;
  onLogout: () => void;
}

export default function AdminMobileMenu({ currentPath, onLogout }: AdminMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const activePath = currentPath || pathname;

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Prevent horizontal scroll always
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/admin/dashboard', label: 'Payments' },
    { href: '/admin/registrations', label: 'Registrations' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/events', label: 'Events' },
    { href: '/admin/scanner', label: 'QR Scanner' },
    { href: '/admin/logs', label: 'Activity Logs' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/settings', label: 'Settings' },
    { href: '/dashboard', label: 'User Dashboard' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        className="lg:hidden p-2 rounded-lg hover:bg-purple-50 transition-all w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Hamburger Icon */}
          <i
            className={`absolute w-full h-[2px] sm:h-[2.5px] transition-all duration-300 ease-in-out ${
              isOpen
                ? 'bg-transparent rotate-90'
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
            style={{
              top: '50%',
              left: 0,
              transformOrigin: 'center',
            }}
          >
            <span
              className={`absolute w-full h-[2px] sm:h-[2.5px] bg-white left-1/2 transition-transform duration-300 shadow-md ${
                isOpen
                  ? 'rotate-45 -translate-x-1/2 -translate-y-1/2'
                  : '-translate-x-1/2 -translate-y-[10px] sm:-translate-y-[12px] bg-gradient-to-r from-purple-600 to-pink-600'
              }`}
              style={{ transformOrigin: '50% 50%' }}
            />
            <span
              className={`absolute w-full h-[2px] sm:h-[2.5px] bg-white left-1/2 transition-transform duration-300 shadow-md ${
                isOpen
                  ? '-rotate-45 -translate-x-1/2 -translate-y-1/2'
                  : '-translate-x-1/2 translate-y-[10px] sm:translate-y-[12px] bg-gradient-to-r from-purple-600 to-pink-600'
              }`}
              style={{ transformOrigin: '50% 50%' }}
            />
          </i>
        </div>
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto z-[60]' : 'opacity-0 pointer-events-none -z-10'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[35vw] max-w-md transition-all duration-300 ease-in-out lg:hidden overflow-hidden shadow-2xl ${
          isOpen
            ? 'translate-x-0 z-[70] pointer-events-auto visible'
            : 'translate-x-full -z-10 pointer-events-none invisible'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.98) 0%, rgba(219, 39, 119, 0.98) 100%)',
        }}
      >
        {/* Menu Header with Close Button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/20">
          <h2 className="text-white text-xl font-bold">Admin Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/20 transition-all"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Menu Items Container */}
        <div className="h-full w-full pb-6 overflow-y-auto">
          <ul className="w-full px-4">
            {menuItems.map((item, index) => (
              <li
                key={item.href}
                className={`list-none transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 0.05}s` : '0s',
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-left text-white no-underline py-3.5 px-4 my-1 text-base sm:text-lg font-medium rounded-lg transition-all hover:bg-white/20 active:bg-white/30 ${
                    activePath === item.href ? 'bg-white/25 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Logout Button */}
            <li
              className={`list-none transition-all duration-300 border-t border-white/30 mt-4 pt-4 ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{
                transitionDelay: isOpen ? `${menuItems.length * 0.05}s` : '0s',
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left text-white py-3.5 px-4 text-base sm:text-lg font-medium rounded-lg transition-all bg-red-500/20 hover:bg-red-500/40 active:bg-red-500/50"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
