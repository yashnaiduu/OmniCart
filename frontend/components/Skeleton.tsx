'use client';

import { motion } from 'framer-motion';

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#12141A] ${className}`}>
      <div
        className="absolute inset-0 z-10 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
          transform: 'translate3d(-100%, 0, 0)',
          animation: 'shimmer 1.5s infinite linear',
          willChange: 'transform'
        }}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="luxon-glass rounded-luxon-lg p-5"
    >
      <div className="flex flex-col items-center mb-4">
        <SkeletonBlock className="w-28 h-28 rounded-luxon-md" />
        <div className="mt-3 w-full flex flex-col items-center gap-2">
          <SkeletonBlock className="h-5 w-32 rounded-luxon-sm" />
          <SkeletonBlock className="h-3 w-24 rounded-luxon-sm" />
        </div>
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-luxon-sm border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-6 w-16 rounded-luxon-sm" />
              <SkeletonBlock className="h-4 w-12 rounded-luxon-sm" />
            </div>
            <div className="text-right">
              <SkeletonBlock className="h-6 w-10 mb-1 rounded-luxon-sm inline-block" />
              <div className="block" />
              <SkeletonBlock className="h-3 w-12 rounded-luxon-sm inline-block" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonFeedCard() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-24 rounded-luxon-sm" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-luxon-sm border border-white/5 bg-white/[0.02]">
            <SkeletonBlock className="h-4 w-32 rounded-luxon-sm" />
            <SkeletonBlock className="h-4 w-16 rounded-luxon-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
