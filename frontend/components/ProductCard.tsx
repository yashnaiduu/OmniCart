'use client';

import { motion } from 'framer-motion';
import { ProductOption } from '@/lib/api';

const platformColors: Record<string, string> = {
  blinkit: 'bg-yellow-400 text-yellow-900',
  zepto: 'bg-purple-500 text-white',
  instamart: 'bg-orange-500 text-white',
  bigbasket: 'bg-lime-500 text-white',
};

const platformIcons: Record<string, string> = {
  blinkit: '⚡',
  zepto: '🚀',
  instamart: '🛒',
  bigbasket: '🧺',
};

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${platformColors[platform] || 'bg-gray-200 text-gray-800'}`}
    >
      {platformIcons[platform] || '📦'} {platform}
    </span>
  );
}

interface ProductCardProps {
  name: string;
  normalizedName: string;
  options: ProductOption[];
  recommended: { platform: string; reason: string } | null;
  onAddToCart?: (option: ProductOption) => void;
}

export function ProductCard({
  name,
  options,
  recommended,
  onAddToCart,
}: ProductCardProps) {
  const cheapest = options.reduce(
    (min, o) => (o.price < min.price ? o : min),
    options[0],
  );
  const fastest = options.reduce(
    (min, o) => (o.eta_minutes < min.eta_minutes ? o : min),
    options[0],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {options[0]?.normalized_name || name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{name}</p>
        </div>
        {recommended && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            ✨ {recommended.reason.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Platform options */}
      <div className="space-y-2.5">
        {options
          .sort((a, b) => a.price - b.price)
          .map((option, idx) => {
            const isRecommended =
              recommended?.platform === option.platform;
            const isCheapest = option === cheapest;
            const isFastest = option === fastest;

            return (
              <motion.div
                key={`${option.platform}-${idx}`}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                  isRecommended
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                }`}
                onClick={() => onAddToCart?.(option)}
              >
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={option.platform} />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      {option.quantity}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isCheapest && options.length > 1 && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          Cheapest
                        </span>
                      )}
                      {isFastest && options.length > 1 && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                          Fastest
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{option.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {option.eta_minutes} min
                  </p>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
