'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { PincodeBar } from '@/components/PincodeBar';
import { useAuthStore, usePreferencesStore } from '@/store';
import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-32 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-6 sm:mb-8">
          ⚙️ Profile
        </h1>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="soft-card p-5 sm:p-6 border border-gray-100 mb-4"
        >
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Account</h2>
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center text-sm font-bold">
                  {email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{email}</p>
                  <p className="text-xs text-[#9CA3AF]">Logged in</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-xs font-semibold text-[#DC2626] hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Not logged in</p>
          )}
        </motion.div>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="soft-card p-5 sm:p-6 border border-gray-100 mb-4"
        >
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Location</h2>
          <PincodeBar />
        </motion.div>

        {/* Search Mode */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="soft-card p-5 sm:p-6 border border-gray-100 mb-4"
        >
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Default Search Mode</h2>
          <div className="flex gap-2 sm:gap-3">
            {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-[#111827] text-white shadow-sm'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {m === 'cheapest' && '💰 '}
                {m === 'balanced' && '⚖️ '}
                {m === 'fastest' && '⚡ '}
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Budget */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="soft-card p-5 sm:p-6 border border-gray-100 mb-4"
        >
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Monthly Budget</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] font-semibold">₹</span>
              <input
                type="number"
                placeholder="5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-[#F3F4F6] rounded-xl text-sm font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all duration-200"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveBudget}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                budgetSaved
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#111827] text-white hover:bg-[#1F2937]'
              }`}
            >
              {budgetSaved ? '✓ Saved' : 'Save'}
            </motion.button>
          </div>
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="soft-card p-5 sm:p-6 border border-gray-100"
        >
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">About</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Version</span>
              <span className="text-[#111827] font-semibold">1.0.0 MVP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Platforms</span>
              <span className="text-[#111827] font-semibold">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Default Pincode</span>
              <span className="text-[#111827] font-semibold">{pincode}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-[#9CA3AF] leading-relaxed">
              OmniCart is an independent comparison tool. Not affiliated with any listed platform.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
