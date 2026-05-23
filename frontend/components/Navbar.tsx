'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { useAuthStore, useCartStore } from '@/store';
import { useEffect, useState } from 'react';
import { CartDrawer } from './CartDrawer';
import { SPRING } from '@/lib/motion';

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
  const cartControls = useAnimation();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Bounce animation when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      cartControls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
      });
    }
  }, [cartItems.length, cartControls]);

  return (
    <>
    <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    <nav className="sticky top-0 z-50 bg-[#0A0B0D]/80 backdrop-blur-xl border-b border-white/5 safe-top">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 outline-none group">
            <div className="w-8 h-8 rounded-luxon-sm bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">
              O
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-heading">
              OmniCart
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 rounded-luxon-md border border-white/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-luxon-sm text-sm font-semibold transition-all duration-200 outline-none ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-luxon-sm"
                      initial={false}
                      transition={SPRING.snappy}
                    />
                  )}
                  <span className="relative z-10 font-heading">
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
                animate={cartControls}
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 hover:bg-violet-500/30"
              >
                Cart ({cartItems.length})
              </motion.button>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white flex items-center justify-center text-[10px] font-bold">
                    {email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-300">
                    {email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-gray-500 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-luxon-sm shadow-lg shadow-violet-500/20 transition-all duration-200 active:scale-95 font-heading"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0A0B0D]/90 backdrop-blur-xl border-t border-white/5 z-50 safe-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-luxon-sm text-[11px] font-bold transition-all duration-200 font-heading ${
                  isActive ? 'text-violet-400 bg-violet-500/10' : 'text-gray-500'
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
