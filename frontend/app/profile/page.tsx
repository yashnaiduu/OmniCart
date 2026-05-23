'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PincodeBar } from '@/components/PincodeBar';
import { useAuthStore, usePreferencesStore } from '@/store';
import { useEffect, useState } from 'react';
import { SPRING, staggerContainer, staggerItem } from '@/lib/motion';

export default function ProfilePage() {
  const { isLoggedIn, email, logout, hydrate: hydrateAuth } = useAuthStore();
  const { pincode, mode, setMode, hydrate: hydratePrefs } = usePreferencesStore();
  const [budget, setBudget] = useState('');
  const [budgetSaved, setBudgetSaved] = useState(false);

  useEffect(() => {
    hydrateAuth();
    hydratePrefs();
  }, [hydrateAuth, hydratePrefs]);

  const handleSaveBudget = async () => {
    const val = parseInt(budget, 10);
    if (isNaN(val) || val <= 0) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      await fetch('/api/v1/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ monthly_limit: val }),
      });
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#EEF2F6]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6 sm:mb-8 font-heading">
          Settings
        </h1>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* Account */}
          <motion.div
            variants={staggerItem}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-6"
          >
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">Account</h2>
            {isLoggedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                    {email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{email}</p>
                    <p className="text-xs text-gray-500">Logged in</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-2 rounded-luxon-sm hover:bg-red-500/10 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not logged in</p>
            )}
          </motion.div>

          {/* Location */}
          <motion.div
            variants={staggerItem}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-6"
          >
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">Location</h2>
            <PincodeBar />
          </motion.div>

          {/* Search Mode */}
          <motion.div
            variants={staggerItem}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-6"
          >
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">Default Search Mode</h2>
            <div className="flex gap-2 sm:gap-3">
              {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING.snappy}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-luxon-sm text-sm font-semibold transition-all duration-200 font-heading ${
                    mode === m
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Budget */}
          <motion.div
            variants={staggerItem}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-6"
          >
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">Monthly Budget</h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold font-mono">₹</span>
                <input
                  type="number"
                  placeholder="5000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 luxon-input rounded-luxon-sm text-sm font-mono"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={SPRING.snappy}
                onClick={handleSaveBudget}
                className={`px-5 py-3 rounded-luxon-sm text-sm font-semibold transition-all duration-200 font-heading ${
                  budgetSaved
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20'
                }`}
              >
                {budgetSaved ? 'Saved' : 'Save'}
              </motion.button>
            </div>
          </motion.div>

          {/* App info */}
          <motion.div
            variants={staggerItem}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-6"
          >
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">About</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Version</span>
                <span className="text-white font-semibold font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platforms</span>
                <span className="text-white font-semibold font-mono">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pincode</span>
                <span className="text-white font-semibold font-mono">{pincode}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-600 leading-relaxed">
                OmniCart is an independent comparison tool. Not affiliated with any listed platform.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
