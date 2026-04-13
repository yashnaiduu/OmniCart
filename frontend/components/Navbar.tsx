'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore, useCartStore } from '@/store';
import { useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/collections', label: 'Lists', icon: '📋' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, email, logout, hydrate } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              OmniCart
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              AI
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-blue-50 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {item.icon} {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart badge */}
            {cartItems.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                🛒 {cartItems.length}
              </motion.div>
            )}

            {/* Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
