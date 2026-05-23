'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/lib/api';
import { VoiceSearch } from './VoiceSearch';
import { SPRING, MOTION_SPEEDS, STAGGER_DELAY } from '@/lib/motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleVoiceResult = useCallback((transcript: string) => {
    setQuery(transcript);
    onSearch(transcript);
  }, [onSearch]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.suggestions(query);
        setSuggestions(res.data?.data?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newQuery = query ? `${query}, ${suggestion}` : suggestion;
    setQuery(newQuery);
    setShowSuggestions(false);
    onSearch(newQuery);
  };

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Breathing glow wrapper */}
        <motion.div
          className="relative rounded-luxon-lg"
          animate={isFocused ? {
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
              '0 0 30px rgba(139, 92, 246, 0.35), 0 0 80px rgba(139, 92, 246, 0.15)',
              '0 0 20px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
            ],
          } : {
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.1), 0 0 60px rgba(139, 92, 246, 0.05)',
          }}
          transition={isFocused ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          <div className="relative luxon-glass rounded-luxon-lg overflow-hidden">
            <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { duration: 0.8, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.15 } }}
                    className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full"
                  />
                ) : (
                  <motion.svg
                    key="search"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
              onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); setIsFocused(false); }}
              placeholder="Search groceries... e.g. milk, bread, pasta"
              className="w-full pl-14 sm:pl-16 pr-24 sm:pr-28 py-5 sm:py-5 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base font-sans"
              id="search-input"
            />
            <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center gap-1">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                transition={SPRING.snappy}
                disabled={isLoading || query.trim().length === 0}
                suppressHydrationWarning
                className="px-4 sm:px-5 py-2.5 bg-violet-600 text-white rounded-luxon-sm text-sm font-bold font-heading hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Search
              </motion.button>
              <VoiceSearch onResult={handleVoiceResult} disabled={isLoading} />
            </div>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: MOTION_SPEEDS.macro.duration, ease: MOTION_SPEEDS.macro.ease }}
            className="absolute top-full left-0 right-0 mt-2 luxon-glass rounded-luxon-md overflow-hidden z-50"
          >
            <div className="p-3">
              <p className="text-xs text-gray-500 px-2 py-1 font-medium font-heading uppercase tracking-widest">
                Also add:
              </p>
              <div className="flex flex-wrap gap-1.5 px-2 py-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * STAGGER_DELAY, ...MOTION_SPEEDS.macro }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-luxon-sm text-sm transition-all duration-200 capitalize font-medium"
                  >
                    + {s}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
