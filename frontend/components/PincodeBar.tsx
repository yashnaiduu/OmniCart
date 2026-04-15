'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '@/store';

export function PincodeBar() {
  const { pincode, setPincode, hydrate } = usePreferencesStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pincode);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setDraft(pincode);
  }, [pincode]);

  const handleSave = () => {
    const clean = draft.trim().replace(/\D/g, '');
    if (clean.length === 6) {
      setPincode(clean);
      setEditing(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
          );
          const data = await res.json();
          const detectedPincode = data?.address?.postcode;
          if (detectedPincode) {
            setPincode(detectedPincode);
            setDraft(detectedPincode);
          }
        } catch {
          // Silently fail
        } finally {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm">
        <svg className="w-4 h-4 text-[#9CA3AF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={6}
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-20 text-sm font-semibold text-[#111827] bg-transparent border-b-2 border-[#2563EB] outline-none text-center py-0.5"
              placeholder="560067"
            />
            <button
              onClick={handleSave}
              className="text-[10px] sm:text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-all duration-200 px-1.5"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setDraft(pincode); }}
              className="text-[10px] sm:text-xs font-semibold text-[#9CA3AF] hover:text-[#6B7280] transition-all duration-200"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#2563EB] transition-all duration-200 flex items-center gap-1"
          >
            {pincode}
            <span className="text-[#9CA3AF] text-[10px]">✎</span>
          </button>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleDetectLocation}
        disabled={detecting}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-gray-100 rounded-xl text-xs sm:text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-all duration-200 disabled:opacity-50"
      >
        {detecting ? (
          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="hidden sm:inline">Detect Location</span>
        <span className="sm:hidden">Detect</span>
      </motion.button>
    </div>
  );
}
