'use client';

import { useState, useEffect } from 'react';
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

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [parsedItems, setParsedItems] = useState<{ item: string; quantity?: string }[]>([]);
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
      setParsedItems(data.parsed_items || []);
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

  const allPlatforms = ['blinkit', 'zepto', 'instamart', 'bigbasket', 'amazonfresh'];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-8">
        {/* Search bar */}
        <div className="mb-5 sm:mb-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Pincode / Location */}
        <div className="mb-4 sm:mb-5">
          <PincodeBar />
        </div>

        {/* Mode selector — clean, per design.md button styles */}
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6 overflow-x-auto px-2 pb-1">
          {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`shrink-0 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'bg-white text-[#6B7280] border border-gray-100 hover:border-gray-200 hover:bg-[#F9FAFB]'
              }`}
            >
              {m === 'cheapest' && '💰 '}
              {m === 'balanced' && '⚖️ '}
              {m === 'fastest' && '⚡ '}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Parsed items chips */}
        <AnimatePresence>
          {parsedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 flex-wrap justify-center mb-4"
            >
              <span className="text-xs text-[#9CA3AF]">Parsed:</span>
              {parsedItems.map((p, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1.5 bg-[#F3F4F6] text-[#111827] text-xs rounded-lg capitalize font-medium"
                >
                  {p.item}
                  {p.quantity && ` (${p.quantity})`}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform status */}
        {hasSearched && !isLoading && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-6 flex-wrap">
            {allPlatforms.map((p) => {
              const responded = platforms.responded.includes(p);
              const failed = platforms.failed.includes(p);
              return (
                <div
                  key={p}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                    responded
                      ? 'text-[#16A34A] bg-green-50'
                      : failed
                        ? 'text-[#DC2626] bg-red-50'
                        : 'text-[#9CA3AF] bg-[#F3F4F6]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    responded ? 'bg-[#16A34A] live-dot' : failed ? 'bg-[#DC2626]' : 'bg-[#9CA3AF]'
                  }`} />
                  {p === 'amazonfresh' ? 'Amazon' : p.charAt(0).toUpperCase() + p.slice(1)}
                  {failed && <span className="text-[9px] opacity-60">(unavailable)</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
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
          </motion.div>
        ) : hasSearched ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-6">
              🔍
            </div>
            <p className="text-[#111827] text-base sm:text-lg font-semibold">No results found</p>
            <p className="text-[#9CA3AF] text-sm mt-2 max-w-xs mx-auto">
              Platforms may be temporarily unavailable. Try a different search or check back soon.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-6">
              🛒
            </div>
            <p className="text-[#111827] text-base sm:text-lg font-semibold">
              Search for groceries above
            </p>
            <p className="text-[#9CA3AF] text-sm mt-2">
              Try &quot;milk and bread&quot; or &quot;pasta dinner&quot;
            </p>
          </motion.div>
        )}

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 soft-card p-5 border border-gray-100"
            >
              <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">
                🧠 You might also need
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                  >
                    + {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legal Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-[#9CA3AF] max-w-lg mx-auto">
            Prices sourced from publicly available data. OmniCart is not affiliated with any listed platform.
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
