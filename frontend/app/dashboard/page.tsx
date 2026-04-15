'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useCartStore, usePreferencesStore } from '@/store';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { items, totalCost } = useCartStore();
  const { hydrate } = usePreferencesStore();
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    hydrate();
    let saved = 0;
    for (const item of items) {
      saved += item.selectedOption.price * 0.15;
    }
    setTotalSaved(Math.round(saved));
  }, [hydrate, items]);

  const stats = [
    { label: 'Items in Cart', value: items.length, icon: '🛒' },
    { label: 'Cart Total', value: `₹${totalCost()}`, icon: '💰' },
    { label: 'Est. Savings', value: `₹${totalSaved}`, icon: '📉' },
    {
      label: 'Platforms Used',
      value: new Set(items.map((i) => i.selectedOption.platform)).size,
      icon: '🏪',
    },
  ];

  const platformBreakdown = items.reduce(
    (acc, item) => {
      const p = item.selectedOption.platform;
      if (!acc[p]) acc[p] = { count: 0, total: 0 };
      acc[p].count += 1;
      acc[p].total += item.selectedOption.price * item.quantity;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>,
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-6 sm:mb-8">
          📊 Savings Dashboard
        </h1>

        {/* Stats grid — clean, flat design */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.2 }}
              className="soft-card p-4 sm:p-6 border border-gray-100"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-lg sm:text-xl mb-3">
                {stat.icon}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-[#111827] mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Platform breakdown */}
        {Object.keys(platformBreakdown).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="soft-card p-5 sm:p-8 border border-gray-100 mb-6"
          >
            <h2 className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4 sm:mb-6">
              📦 Platform Breakdown
            </h2>
            <div className="space-y-2.5">
              {Object.entries(platformBreakdown).map(([platform, data]) => (
                <div key={platform} className="flex items-center justify-between p-3 sm:p-4 bg-[#F9FAFB] rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-[#111827] capitalize">{platform}</p>
                    <p className="text-xs text-[#9CA3AF]">{data.count} items</p>
                  </div>
                  <p className="text-lg font-bold text-[#111827]">₹{data.total}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Spending tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="soft-card p-5 sm:p-8 border border-gray-100"
        >
          <h2 className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">
            💡 Smart Tips
          </h2>
          <div className="space-y-2.5">
            {[
              'Use "cheapest" mode to always pick the lowest price.',
              'Add items to collections for quick refill reorders.',
              'Compare across all 5 platforms for the best deals.',
              'Set a monthly budget to track your spending.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F3F4F6] transition-all duration-200">
                <span className="text-[#16A34A] mt-0.5">✓</span>
                <p className="text-sm text-[#6B7280] font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
