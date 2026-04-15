'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore, useCartStore } from '@/store';
import { useEffect, useState } from 'react';
import { CartDrawer } from './CartDrawer';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/collections', label: 'Lists' },
  { href: '/dashboard', label: 'Savings' },
  { href: '/profile', label: 'Settings' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, email, logout, hydrate } = useAuthStore();
  const cartItems = useCartStore((s) => s.items);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
    <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F3F4F6] safe-top">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 outline-none group">
            <div className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center text-white text-sm font-bold">
              O
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">
              OmniCart
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-xl">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 outline-none ${
                    isActive
                      ? 'text-white'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#111827] rounded-xl"
                      initial={false}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {cartItems.length > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-white rounded-full text-xs font-bold shadow-sm cursor-pointer transition-all duration-200 hover:bg-[#1F2937] active:scale-95"
              >
                Cart ({cartItems.length})
              </motion.button>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] rounded-full">
                  <div className="w-6 h-6 rounded-full bg-[#111827] text-white flex items-center justify-center text-[10px] font-bold">
                    {email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">
                    {email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-[#9CA3AF] hover:text-[#DC2626] px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-bold text-white bg-[#111827] hover:bg-[#1F2937] px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#F3F4F6] z-50 safe-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl text-[11px] font-bold transition-all duration-200 ${
                  isActive ? 'text-[#2563EB] bg-blue-50' : 'text-[#9CA3AF]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
    </>
  );
}
