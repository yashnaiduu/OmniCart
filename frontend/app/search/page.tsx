'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
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

  const { pincode, mode, setMode } = usePreferencesStore();
  const addToCart = useCartStore((s) => s.addItem);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
        {/* Search bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Mode selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['cheapest', 'balanced', 'fastest'] as const).map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
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
              <span className="text-xs text-gray-500">Parsed:</span>
              {parsedItems.map((p, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg capitalize"
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
          <div className="flex items-center justify-center gap-3 mb-6 text-xs">
            {platforms.responded.map((p) => (
              <span key={p} className="text-green-600 flex items-center gap-1">
                ✓ {p}
              </span>
            ))}
            {platforms.failed.map((p) => (
              <span key={p} className="text-red-400 flex items-center gap-1">
                ✗ {p}
              </span>
            ))}
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
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg">No results found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try a different search or check your pincode
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500 text-lg">
              Search for groceries above
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try &quot;milk and bread&quot; or &quot;pasta dinner&quot;
            </p>
          </motion.div>
        )}

        {/* Suggestions */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                🧠 You might also need
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors capitalize"
                  >
                    + {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
