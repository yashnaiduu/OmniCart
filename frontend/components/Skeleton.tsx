'use client';

import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-gray-100 p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="skeleton h-5 w-24 mb-2" />
          <div className="skeleton h-3 w-40" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-50">
            <div className="flex items-center gap-3">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-4 w-12" />
            </div>
            <div className="text-right">
              <div className="skeleton h-6 w-10 mb-1" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonFeedCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
