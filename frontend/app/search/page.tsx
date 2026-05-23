'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { PincodeBar } from '@/components/PincodeBar';
import { ProductCard, PlatformBadge } from '@/components/ProductCard';
import { SkeletonCard } from '@/components/Skeleton';
import { searchApi, SearchItem, ProductOption } from '@/lib/api';
import { useCartStore, usePreferencesStore } from '@/store';
import { Suspense } from 'react';
import { staggerContainer, staggerItem, SPRING, STAGGER_DELAY, MOTION_SPEEDS } from '@/lib/motion';

/* ── Horizontal scroll section ── */
function HorizontalSection({
  title,
  items,
  onAddToCart,
}: {
  title: string;
  items: { item: SearchItem; option: ProductOption }[];
  onAddToCart: (item: SearchItem, option: ProductOption) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1 font-heading">
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {items.map(({ item, option }, idx) => (
          <motion.div
            key={`${option.platform}-${item.normalized_name}-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx, 8) * STAGGER_DELAY, ...MOTION_SPEEDS.macro }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart(item, option)}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] luxon-glass rounded-luxon-lg p-4 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {option.imageUrl ? (
                <div className="w-[72px] h-[72px] rounded-luxon-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={option.imageUrl}
                    alt={option.name}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-[72px] h-[72px] rounded-luxon-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-xl font-bold text-gray-600">
                    {option.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white capitalize truncate leading-tight">
                    {option.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {option.metadata?.weight || 'Standard'}
                  </p>
                </div>
                {option.price.current > 0 && (
                  <p className="text-lg font-bold text-white shrink-0 font-mono tabular-nums">₹{option.price.current}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <PlatformBadge platform={option.platform} isWinner />
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                {option.delivery.eta} min
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Best option hero card ── */
function BestOptionCard({
  item,
  option,
  reason,
  onAdd,
}: {
  item: SearchItem;
  option: ProductOption;
  reason: string;
  onAdd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING.smooth}
      className="luxon-glass rounded-luxon-xl p-5 sm:p-6 border-violet-500/20 mb-8 relative overflow-hidden"
    >
      {/* Violet lightwell behind best option */}
      <div className="absolute inset-0 luxon-lightwell luxon-lightwell-violet opacity-20 -z-10" />
      
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-widest font-heading">Best Option</span>
        <span className="text-xs text-gray-500">{reason}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-3">
        <div className="flex items-center gap-4">
          {option.imageUrl ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-luxon-md bg-white/5 border border-white/5 p-2 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={option.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-luxon-md bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-gray-600">{(item.normalized_name || item.name).charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-white capitalize truncate font-heading">{item.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <PlatformBadge platform={option.platform} isWinner />
              <span className="text-xs text-gray-500">{option.metadata?.weight || 'Standard'}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-heading">
                {option.delivery.eta} min
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {option.price.current > 0 && (
            <p className="text-2xl font-bold text-white font-mono tabular-nums">₹{option.price.current}</p>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snappy}
            onClick={onAdd}
            className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-luxon-sm text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20 font-heading"
          >
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<{ responded: string[]; failed: string[] }>({
    responded: [],
    failed: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { pincode, mode, setMode, hydrate: hydratePrefs } = usePreferencesStore();
  const addToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    hydratePrefs();
  }, [hydratePrefs]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await searchApi.search(query, pincode, mode);
      const data = res.data.data;
      setResults(data.items || []);
      setSuggestions(data.suggestions || []);
      setPlatforms({
        responded: data.platforms_responded || [],
        failed: data.platforms_failed || [],
      });
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = (item: SearchItem, option: ProductOption) => {
    addToCart({
      name: item.name,
      normalizedName: item.normalized_name,
      selectedOption: option,
      quantity: 1,
    });
  };

  /* ── Derived data: best option, cheapest list, fastest list ── */
  const { bestOption, cheapestItems, fastestItems } = useMemo(() => {
    if (results.length === 0) {
      return { bestOption: null, cheapestItems: [], fastestItems: [] };
    }

    let bestOpt: { item: SearchItem; option: ProductOption; reason: string } | null = null;
    const cheapest: { item: SearchItem; option: ProductOption }[] = [];
    const fastest: { item: SearchItem; option: ProductOption }[] = [];

    for (const item of results) {
      if (!item.options || item.options.length === 0) continue;

      if (item.recommended && !bestOpt) {
        const recOption = item.options.find((o) => o.platform === item.recommended!.platform);
        if (recOption) {
          bestOpt = { item, option: recOption, reason: item.recommended.reason };
        }
      }

      const sorted = [...item.options].filter((o) => o.price.current > 0).sort((a, b) => a.price.current - b.price.current);
      if (sorted.length > 0) {
        cheapest.push({ item, option: sorted[0] });
      }

      const bySpeeed = [...item.options].filter((o) => o.delivery.eta > 0).sort((a, b) => a.delivery.eta - b.delivery.eta);
      if (bySpeeed.length > 0) {
        fastest.push({ item, option: bySpeeed[0] });
      }
    }

    if (!bestOpt && cheapest.length > 0) {
      const overall = cheapest.reduce((a, b) => (a.option.price.current <= b.option.price.current ? a : b));
      bestOpt = { ...overall, reason: 'Lowest price' };
    }

    return { bestOption: bestOpt, cheapestItems: cheapest, fastestItems: fastest };
  }, [results]);

  const failedCount = platforms.failed.length;

  return (
    <div className="w-full min-h-screen bg-[#0A0B0D] text-[#EEF2F6] relative overflow-hidden">
      {/* Background lightwells */}
      <div className="absolute top-0 left-[10%] w-[50%] h-[40%] luxon-lightwell luxon-lightwell-violet animate-luxon-pulse opacity-40" />
      <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] luxon-lightwell luxon-lightwell-cyan animate-luxon-pulse opacity-30" style={{ animationDelay: '-4s' }} />

      <Navbar />

      {/* Sticky search area */}
      <div className="sticky top-14 sm:top-16 z-40 bg-[#0A0B0D]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <div className="flex items-center justify-between mt-3">
            <PincodeBar />
            <div className="flex items-center gap-1.5">
              {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-luxon-sm text-xs font-semibold transition-all duration-200 font-heading ${
                    mode === m
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-8 relative z-10">

        {/* Platform status */}
        {hasSearched && !isLoading && failedCount > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <span>{platforms.responded.length} platform{platforms.responded.length !== 1 ? 's' : ''} responded</span>
            <span className="text-gray-700">·</span>
            <span className="text-red-400">{failedCount} unavailable</span>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div key={i} variants={staggerItem}>
                <SkeletonCard />
              </motion.div>
            ))}
          </motion.div>
        ) : results.length > 0 ? (
          <>
            {/* LAYER 1: Best option card */}
            {bestOption && (
              <div className="mb-10">
                <BestOptionCard
                  item={bestOption.item}
                  option={bestOption.option}
                  reason={bestOption.reason}
                  onAdd={() => handleAddToCart(bestOption.item, bestOption.option)}
                />
              </div>
            )}

            {/* LAYER 2: Horizontal sections */}
            <HorizontalSection
              title="Best Price"
              items={cheapestItems}
              onAddToCart={handleAddToCart}
            />
            <HorizontalSection
              title="Fastest Delivery"
              items={fastestItems}
              onAddToCart={handleAddToCart}
            />

            {/* LAYER 3: All results grid */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight font-heading">
                  All Groceries
                </h2>
                <span className="text-sm font-medium text-gray-500">
                  {results.length} items
                </span>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
              >
                {results.map((item, i) => (
                  <motion.div key={`${item.normalized_name}-${i}`} variants={staggerItem}>
                    <ProductCard
                      name={item.name}
                      normalizedName={item.normalized_name}
                      options={item.options}
                      recommended={item.recommended}
                      onAddToCart={(option) => handleAddToCart(item, option)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-16">
            <p className="text-white text-base font-semibold font-heading">No results found</p>
            <p className="text-gray-500 text-sm mt-2">Try a different search term.</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-white text-base font-semibold font-heading">Search for groceries above</p>
            <p className="text-gray-500 text-sm mt-2">
              e.g. &quot;milk and bread&quot; or &quot;pasta dinner&quot;
            </p>
          </div>
        )}

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={SPRING.smooth}
              className="mt-8 luxon-glass rounded-luxon-lg p-5"
            >
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 font-heading">
                Related
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-luxon-sm text-sm font-medium transition-all duration-200 capitalize"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 max-w-lg mx-auto">
            Prices sourced from publicly available data. Not affiliated with any listed platform.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
