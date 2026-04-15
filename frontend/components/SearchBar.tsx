'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/lib/api';
import { VoiceSearch } from './VoiceSearch';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search groceries... e.g. milk, bread, pasta"
            className="w-full pl-12 sm:pl-14 pr-20 sm:pr-24 py-4 sm:py-5 bg-[#F3F4F6] rounded-2xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-base transition-all duration-200"
            id="search-input"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !query.trim()}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-[#1F2937] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Search'
              )}
            </motion.button>
            <VoiceSearch onResult={handleVoiceResult} disabled={isLoading} />
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="text-xs text-[#9CA3AF] px-3 py-1 font-medium">
                Also add:
              </p>
              <div className="flex flex-wrap gap-1.5 px-3 py-2">
                {suggestions.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] text-sm rounded-lg transition-all duration-200 capitalize font-medium"
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
