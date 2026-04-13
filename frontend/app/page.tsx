'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { PlatformBadge } from '@/components/ProductCard';
import { SkeletonFeedCard } from '@/components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { feedApi } from '@/lib/api';
import { useAuthStore } from '@/store';
import { useEffect } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { isLoggedIn, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { data: feedData, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await feedApi.getFeed();
      return res.data.data;
    },
    enabled: isLoggedIn,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Smart Grocery
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Shopping
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Compare prices across Blinkit, Zepto, Instamart & BigBasket.
            Save money on every order.
          </p>
          <Link href="/search">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 px-8 py-3.5 bg-blue-500 text-white rounded-2xl text-base font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors"
            >
              🔍 Start Searching
            </motion.button>
          </Link>
        </motion.div>

        {/* Platform chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-10 flex-wrap"
        >
          {['blinkit', 'zepto', 'instamart', 'bigbasket'].map((p) => (
            <PlatformBadge key={p} platform={p} />
          ))}
        </motion.div>

        {/* Feed sections (visible when logged in) */}
        {isLoggedIn && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Deals */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                🔥 Today&apos;s Deals
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="space-y-3">
                  {feedData?.deals?.map((deal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 border border-green-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {deal.item}
                        </p>
                        <PlatformBadge platform={deal.platform} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 line-through">
                          ₹{deal.original_price}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{deal.deal_price}
                        </p>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          -{deal.discount_percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Price Drops */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                📉 Price Drops
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="space-y-3">
                  {feedData?.price_drops?.map((drop, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {drop.item}
                        </p>
                        <PlatformBadge platform={drop.platform} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 line-through">
                          ₹{drop.old_price}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{drop.new_price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Refill Suggestions */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                🔄 Time to Refill
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="space-y-2">
                  {feedData?.refill_suggestions?.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {s.item}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last: {s.last_purchased}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Recommendations */}
            <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                🧠 Recommended
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {feedData?.recommendations?.map((r, i) => (
                    <Link href={`/search?q=${r}`} key={i}>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-block px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors capitalize cursor-pointer"
                      >
                        {r}
                      </motion.span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Not logged in → Feature cards */}
        {!isLoggedIn && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
          >
            {[
              {
                icon: '⚡',
                title: 'Compare Instantly',
                desc: 'See prices from 4 platforms side by side',
              },
              {
                icon: '🧠',
                title: 'AI Suggestions',
                desc: 'Type "pasta dinner" and get the full list',
              },
              {
                icon: '💰',
                title: 'Save Money',
                desc: 'Always pick the cheapest or fastest option',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={item}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
