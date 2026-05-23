'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useCartStore, usePreferencesStore } from '@/store';
import { useEffect, useState } from 'react';
import { staggerContainer, staggerItem, SPRING } from '@/lib/motion';

export default function DashboardPage() {
  const { items, totalCost } = useCartStore();
  const { hydrate } = usePreferencesStore();
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    hydrate();
    let saved = 0;
    for (const item of items) {
      saved += item.selectedOption.price.current * 0.15;
    }
    setTotalSaved(Math.round(saved));
  }, [hydrate, items]);

  const stats = [
    { label: 'Items in Cart', value: items.length, glow: 'luxon-lightwell-violet' },
    { label: 'Cart Total', value: `₹${totalCost()}`, glow: 'luxon-lightwell-cyan' },
    { label: 'Est. Savings', value: `₹${totalSaved}`, glow: 'luxon-lightwell-emerald' },
    {
      label: 'Platforms Used',
      value: new Set(items.map((i) => i.selectedOption.platform)).size,
      glow: 'luxon-lightwell-amber',
    },
  ];

  const platformBreakdown = items.reduce(
    (acc, item) => {
      const p = item.selectedOption.platform;
      if (!acc[p]) acc[p] = { count: 0, total: 0 };
      acc[p].count += 1;
      acc[p].total += item.selectedOption.price.current * item.quantity;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>,
  );

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#EEF2F6]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 sm:pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6 sm:mb-8 font-heading">
          Savings
        </h1>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={SPRING.default}
              className="luxon-glass rounded-luxon-lg p-4 sm:p-6 relative overflow-hidden"
            >
              <div className={`absolute inset-0 ${stat.glow} opacity-10 -z-10`} />
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider font-heading">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1 font-mono tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform breakdown */}
        {Object.keys(platformBreakdown).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="luxon-glass rounded-luxon-lg p-5 sm:p-8 mb-6"
          >
            <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-6 font-heading">
              Platform Breakdown
            </h2>
            <div className="space-y-2.5">
              {Object.entries(platformBreakdown).map(([platform, data]) => (
                <div key={platform} className="flex items-center justify-between p-3 sm:p-4 bg-white/[0.03] rounded-luxon-sm border border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{platform}</p>
                    <p className="text-xs text-gray-500">{data.count} items</p>
                  </div>
                  <p className="text-lg font-bold text-white font-mono tabular-nums">₹{data.total}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="luxon-glass rounded-luxon-lg p-5 sm:p-8"
        >
          <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 font-heading">
            Tips
          </h2>
          <div className="space-y-2.5">
            {[
              'Use "cheapest" mode to always pick the lowest price.',
              'Add items to collections for quick reorders.',
              'Compare across all 5 platforms before checkout.',
              'Set a monthly budget to track spending.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-luxon-sm hover:bg-white/5 transition-all duration-200">
                <span className="text-emerald-400 mt-0.5 text-xs font-bold">✓</span>
                <p className="text-sm text-gray-400 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
