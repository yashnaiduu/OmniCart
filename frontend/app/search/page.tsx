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
      <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3 px-1">
        {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {items.map(({ item, option }, idx) => (
          <motion.div
            key={`${option.platform}-${item.normalized_name}-${idx}`}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddToCart(item, option)}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-3 mb-3">
              {option.image_url ? (
                <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={option.image_url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#9CA3AF]">{(item.normalized_name || item.name).charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] capitalize truncate leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">
                    {option.quantity || 'Standard'}
                  </p>
                </div>
                {option.price > 0 && (
                  <p className="text-lg font-bold text-[#111827] shrink-0">₹{option.price}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <PlatformBadge platform={option.platform} />
              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] live-dot" />
                {option.eta_minutes} min
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
      className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-100 shadow-sm mb-8"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-widest">Best Option</span>
        <span className="text-xs text-[#9CA3AF]">{reason}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {option.image_url ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F3F4F6] border border-gray-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={option.image_url}
                alt={item.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F3F4F6] border border-gray-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#9CA3AF]">{(item.normalized_name || item.name).charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-[#111827] capitalize truncate">{item.name}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <PlatformBadge platform={option.platform} />
              <span className="text-xs text-[#6B7280]">{option.quantity || 'Standard'}</span>
              <span className="text-xs text-[#6B7280] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] live-dot" />
                {option.eta_minutes} min
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {option.price > 0 && (
            <p className="text-2xl font-bold text-[#111827]">₹{option.price}</p>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="mt-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-[#1F2937] transition-all duration-200"
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

    // Find the recommended item as "best option"
    let bestOpt: { item: SearchItem; option: ProductOption; reason: string } | null = null;
    const cheapest: { item: SearchItem; option: ProductOption }[] = [];
    const fastest: { item: SearchItem; option: ProductOption }[] = [];

    for (const item of results) {
      if (!item.options || item.options.length === 0) continue;

      // Best option: first recommended item
      if (item.recommended && !bestOpt) {
        const recOption = item.options.find((o) => o.platform === item.recommended!.platform);
        if (recOption) {
          bestOpt = { item, option: recOption, reason: item.recommended.reason };
        }
      }

      // Cheapest: pick the cheapest option per item
      const sorted = [...item.options].filter((o) => o.price > 0).sort((a, b) => a.price - b.price);
      if (sorted.length > 0) {
        cheapest.push({ item, option: sorted[0] });
      }

      // Fastest: pick the fastest option per item
      const bySpeeed = [...item.options].filter((o) => o.eta_minutes > 0).sort((a, b) => a.eta_minutes - b.eta_minutes);
      if (bySpeeed.length > 0) {
        fastest.push({ item, option: bySpeeed[0] });
      }
    }

    // If no recommended, use overall cheapest as best
    if (!bestOpt && cheapest.length > 0) {
      const overall = cheapest.reduce((a, b) => (a.option.price <= b.option.price ? a : b));
      bestOpt = { ...overall, reason: 'Lowest price' };
    }

    return { bestOption: bestOpt, cheapestItems: cheapest, fastestItems: fastest };
  }, [results]);

  const failedCount = platforms.failed.length;

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* Sticky search area */}
      <div className="sticky top-14 sm:top-16 z-40 bg-[#F9FAFB]/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <div className="flex items-center justify-between mt-3">
            <PincodeBar />
            <div className="flex items-center gap-1.5">
              {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === m
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6B7280] hover:bg-[#E5E7EB]'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-8">

        {/* Platform status — compact, only show if there are failures */}
        {hasSearched && !isLoading && failedCount > 0 && (
          <div className="flex items-center gap-2 mb-4 text-xs text-[#9CA3AF]">
            <span>{platforms.responded.length} platform{platforms.responded.length !== 1 ? 's' : ''} responded</span>
            <span className="text-gray-200">·</span>
            <span className="text-[#DC2626]">{failedCount} unavailable</span>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            {/* LAYER 1: Best option card */}
            {bestOption && (
              <BestOptionCard
                item={bestOption.item}
                option={bestOption.option}
                reason={bestOption.reason}
                onAdd={() => handleAddToCart(bestOption.item, bestOption.option)}
              />
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
            <div className="mt-2">
              <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3 px-1">
                All Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((item, i) => (
                  <ProductCard
                    key={`${item.normalized_name}-${i}`}
                    name={item.name}
                    normalizedName={item.normalized_name}
                    options={item.options}
                    recommended={item.recommended}
                    onAddToCart={(option) => handleAddToCart(item, option)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-16">
            <p className="text-[#111827] text-base font-semibold">No results found</p>
            <p className="text-[#9CA3AF] text-sm mt-2">Try a different search term.</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#111827] text-base font-semibold">Search for groceries above</p>
            <p className="text-[#9CA3AF] text-sm mt-2">
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
              className="mt-8 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">
                Related
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-[#9CA3AF] max-w-lg mx-auto">
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
