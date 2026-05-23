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
import { staggerContainer, staggerItem, SPRING } from '@/lib/motion';

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
    <div className="min-h-screen bg-[#0A0B0D] text-[#EEF2F6] overflow-hidden relative selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* ── CINEMATIC AMBIENT LIGHTWELL EMITTERS ── */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] luxon-lightwell luxon-lightwell-violet animate-luxon-pulse" />
      <div className="absolute top-[20%] right-[-15%] w-[70%] h-[70%] luxon-lightwell luxon-lightwell-emerald animate-luxon-pulse" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[65%] h-[65%] luxon-lightwell luxon-lightwell-amber animate-luxon-pulse" style={{ animationDelay: '-5s' }} />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 sm:pb-12 relative z-10">
        
        {/* ── HERO SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="text-center mb-10 sm:mb-16 mt-4 sm:mt-8"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold tracking-widest mb-4 sm:mb-6 backdrop-blur-md font-heading">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot" />
            LIVE COMPARE ENGINE ACTIVE
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-[1.05] font-heading">
            Compare grocery prices<br className="hidden sm:block" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400">
              across 5 platforms.
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed px-4 sm:px-0">
            Search once. Compare prices across <span className="text-white font-medium">Blinkit</span>, <span className="text-white font-medium">Zepto</span>, <span className="text-white font-medium">Instamart</span>, <span className="text-white font-medium">BigBasket</span>, and <span className="text-white font-medium">Amazon Fresh</span> instantly.
          </p>
          
          <div className="mt-8 sm:mt-10">
            <Link href="/search">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING.wobbly}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-luxon-lg text-base sm:text-lg font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 inline-flex items-center gap-3 relative overflow-hidden group cursor-pointer font-heading"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <span className="relative z-10">Search Groceries</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── INTEGRATION CHIPS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-3 sm:gap-4 mb-12 sm:mb-20"
        >
          <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] font-heading">
            Supported Integration Gateways
          </p>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full px-4 pb-1 scrollbar-hide">
            {['blinkit', 'zepto', 'instamart', 'bigbasket', 'amazonfresh'].map((p) => (
              <div key={p} className="shrink-0 bg-white/5 border border-white/5 hover:border-white/10 rounded-luxon-sm px-1.5 py-0.5 transition-colors">
                <PlatformBadge platform={p} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BENTO FEED SECTIONS (Logged In) ── */}
        {isLoggedIn && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
          >
            {/* Deals Card */}
            <div className="relative">
              <div className="absolute inset-0 luxon-lightwell luxon-lightwell-emerald opacity-20 -z-10" />
              <motion.div variants={staggerItem} className="luxon-glass rounded-luxon-lg p-5 sm:p-8 h-full">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-[0.25em] mb-4 sm:mb-6 font-heading">
                  Today&apos;s Deals
                </h2>
                {isLoading ? (
                  <SkeletonFeedCard />
                ) : (
                  <div className="space-y-3">
                    {feedData?.deals?.map((deal: { item: string; platform: string; original_price: number; deal_price: number; discount_percent: number }, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-luxon-sm bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{deal.item}</p>
                          <PlatformBadge platform={deal.platform} />
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs text-gray-500 line-through font-mono">₹{deal.original_price}</p>
                          <p className="text-xl font-bold text-emerald-400 font-mono tabular-nums">₹{deal.deal_price}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            Save {deal.discount_percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Price Drops Card */}
            <div className="relative">
              <div className="absolute inset-0 luxon-lightwell luxon-lightwell-violet opacity-20 -z-10" />
              <motion.div variants={staggerItem} className="luxon-glass rounded-luxon-lg p-5 sm:p-8 h-full">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-[0.25em] mb-4 sm:mb-6 font-heading">
                  Price Drops
                </h2>
                {isLoading ? (
                  <SkeletonFeedCard />
                ) : (
                  <div className="space-y-3">
                    {feedData?.price_drops?.map((drop: { item: string; platform: string; old_price: number; new_price: number }, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 sm:p-4 rounded-luxon-sm bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{drop.item}</p>
                          <PlatformBadge platform={drop.platform} />
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs text-gray-500 line-through font-mono">₹{drop.old_price}</p>
                          <p className="text-xl font-bold text-violet-400 font-mono tabular-nums">₹{drop.new_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Recommendations Card */}
            <motion.div variants={staggerItem} className="luxon-glass rounded-luxon-lg p-5 sm:p-8 lg:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 luxon-lightwell luxon-lightwell-amber opacity-10 -z-10" />
              <h2 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-[0.25em] mb-4 font-heading">
                Recommended Smart Queries
              </h2>
              {isLoading ? (
                <SkeletonFeedCard />
              ) : (
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {feedData?.recommendations?.map((r: string, i: number) => (
                    <Link href={`/search?q=${r}`} key={i}>
                      <motion.span
                        whileHover={{ scale: 1.04, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-luxon-sm text-xs sm:text-sm font-medium transition-all duration-200 capitalize cursor-pointer"
                      >
                        {r} <span className="text-gray-500 font-light">→</span>
                      </motion.span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ── FEATURES SECTION (Not Logged In) ── */}
        {!isLoggedIn && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                title: 'Compare Prices',
                desc: 'See prices from 5 platforms side by side in one search.',
                glow: 'luxon-lightwell-violet',
              },
              {
                title: 'Natural Language',
                desc: 'Type "pasta dinner" and get every item you need.',
                glow: 'luxon-lightwell-cyan',
              },
              {
                title: 'Save Money',
                desc: 'Pick the cheapest or fastest delivery every time.',
                glow: 'luxon-lightwell-emerald',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={SPRING.default}
                className="luxon-glass rounded-luxon-lg p-6 sm:p-8 text-center relative group overflow-hidden"
              >
                <div className={`absolute inset-0 ${f.glow} opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`} />
                <h3 className="text-lg sm:text-2xl text-white mb-2 sm:mb-3 tracking-tight font-heading font-bold">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── DISCLAIMER ── */}
        <div className="mt-16 sm:mt-24 text-center pb-4 relative z-10">
          <div className="luxon-divider mb-8" />
          <p className="text-[10px] sm:text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
            Prices sourced from publicly available data and may not reflect current availability.
            OmniCart is not affiliated with any listed platform.
          </p>
        </div>
      </main>
    </div>
  );
}
