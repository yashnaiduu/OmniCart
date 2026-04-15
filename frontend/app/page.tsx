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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 sm:pb-12">
        {/* Hero — clean, minimal, no gradient blob */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-10 sm:mb-16 mt-4 sm:mt-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3F4F6] text-[#6B7280] text-xs font-semibold tracking-wide mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] live-dot" />
            LIVE REAL-TIME PRICES
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-[#111827] mb-4 sm:mb-6 tracking-tight leading-[1.1]">
            Find the best{' '}
            <span className="text-[#2563EB]">Grocery Deal.</span>
          </h1>
          <p className="text-base sm:text-xl text-[#6B7280] max-w-2xl mx-auto font-medium leading-relaxed px-4 sm:px-0">
            Real-time price comparison across Blinkit, Zepto, Instamart, BigBasket & Amazon Fresh.
          </p>
          <div className="mt-8 sm:mt-10">
            <Link href="/search">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#111827] text-white rounded-2xl text-base sm:text-lg font-bold shadow-sm hover:bg-[#1F2937] transition-all duration-200 inline-flex items-center gap-2 active:scale-95"
              >
                🔍 Start Searching
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Platform chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-3 sm:gap-4 mb-12 sm:mb-20"
        >
          <p className="text-[10px] sm:text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">Supported Platforms</p>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full px-4 pb-1">
            {['blinkit', 'zepto', 'instamart', 'bigbasket', 'amazonfresh'].map((p) => (
              <div key={p} className="shrink-0">
                <PlatformBadge platform={p} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feed sections (logged in) */}
        {isLoggedIn && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8"
          >
            {/* Deals */}
            <motion.div variants={item} className="soft-card p-5 sm:p-8 border border-gray-100">
              <h2 className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                <span className="text-lg sm:text-xl">🔥</span> Today&apos;s Deals
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="space-y-2.5">
                  {feedData?.deals?.map((deal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#F9FAFB] border border-gray-100"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{deal.item}</p>
                        <PlatformBadge platform={deal.platform} />
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs text-[#9CA3AF] line-through">₹{deal.original_price}</p>
                        <p className="text-xl font-bold text-[#16A34A]">₹{deal.deal_price}</p>
                        <span className="text-[10px] text-[#16A34A] font-semibold">
                          Save {deal.discount_percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Price Drops */}
            <motion.div variants={item} className="soft-card p-5 sm:p-8 border border-gray-100">
              <h2 className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
                <span className="text-lg sm:text-xl">📉</span> Price Drops
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="space-y-2.5">
                  {feedData?.price_drops?.map((drop, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#F9FAFB] border border-gray-100"
                    >
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{drop.item}</p>
                        <PlatformBadge platform={drop.platform} />
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xs text-[#9CA3AF] line-through">₹{drop.old_price}</p>
                        <p className="text-xl font-bold text-[#2563EB]">₹{drop.new_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Recommendations */}
            <motion.div variants={item} className="soft-card p-5 sm:p-8 border border-gray-100 lg:col-span-2">
              <h2 className="text-xs sm:text-sm font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="text-lg sm:text-xl">🧠</span> Smart Recommendations
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {feedData?.recommendations?.map((r, i) => (
                    <Link href={`/search?q=${r}`} key={i}>
                      <motion.span
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 capitalize cursor-pointer"
                      >
                        {r} <span className="text-[#9CA3AF]">→</span>
                      </motion.span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Not logged in — Feature cards */}
        {!isLoggedIn && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              {
                icon: '⚡',
                title: 'Compare Instantly',
                desc: 'Real-time prices from 5 platforms side by side.',
              },
              {
                icon: '🧠',
                title: 'AI Suggestions',
                desc: 'Type "pasta dinner" and get the full shopping list.',
              },
              {
                icon: '💰',
                title: 'Always Save',
                desc: 'Pick the cheapest or fastest option every time.',
              },
            ].map((f, i) => (
              <motion.div key={i} variants={item} className="soft-card p-6 sm:p-8 text-center border border-gray-100">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-2 sm:mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm sm:text-base text-[#6B7280] font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Legal Disclaimer */}
        <div className="mt-16 sm:mt-24 text-center pb-4">
          <p className="text-[10px] sm:text-xs text-[#9CA3AF] max-w-xl mx-auto leading-relaxed">
            Prices and product information are sourced from publicly available data and may not reflect current availability.
            OmniCart is an independent comparison tool and is not affiliated with, endorsed by, or sponsored by any of the listed platforms.
          </p>
        </div>
      </main>
    </div>
  );
}
