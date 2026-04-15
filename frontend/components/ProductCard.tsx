'use client';

import { motion } from 'framer-motion';
import { ProductOption } from '@/lib/api';

/* Platform labels — clean text badges, muted colors per design.md */
const platformConfig: Record<string, { color: string; bg: string; label: string }> = {
  blinkit: { color: 'text-amber-800', bg: 'bg-amber-50', label: 'Blinkit' },
  zepto: { color: 'text-violet-700', bg: 'bg-violet-50', label: 'Zepto' },
  instamart: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Instamart' },
  bigbasket: { color: 'text-lime-700', bg: 'bg-lime-50', label: 'BigBasket' },
  amazonfresh: { color: 'text-sky-700', bg: 'bg-sky-50', label: 'Amazon Fresh' },
};

const defaultPlatform = { color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]', label: 'Unknown' };

export function PlatformBadge({ platform }: { platform: string }) {
  const config = platformConfig[platform] || defaultPlatform;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${config.bg} ${config.color}`}
    >
      {config.label}
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
  if (!options || options.length === 0) return null;

  const cheapest = options.reduce(
    (min, o) => (o.price < min.price ? o : min),
    options[0],
  );
  const fastest = options.reduce(
    (min, o) => (o.eta_minutes < min.eta_minutes ? o : min),
    options[0],
  );

  const productImageUrl = options.find((o) => o.image_url)?.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="soft-card p-4 sm:p-6 border border-gray-100 relative"
    >
      {/* Header */}
      <div className="flex gap-3 sm:gap-4 mb-4 items-center">
        {productImageUrl ? (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F3F4F6] border border-gray-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={productImageUrl}
              alt={name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F3F4F6] border border-gray-100 flex items-center justify-center shrink-0">
            <span className="text-2xl opacity-40">🛒</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#111827] capitalize tracking-tight leading-tight truncate">
              {options[0]?.normalized_name || name}
            </h3>
            {recommended && (
              <span className="shrink-0 text-[10px] bg-[#2563EB] text-white px-2 py-0.5 rounded-md font-semibold">
                Top Pick
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#9CA3AF] font-medium mt-0.5 truncate">{name}</p>
        </div>
      </div>

      {/* Platform options */}
      <div className="space-y-2">
        {options
          .sort((a, b) => a.price - b.price)
          .map((option, idx) => {
            const isRecommended = recommended?.platform === option.platform;
            const isCheapest = option === cheapest;
            const isFastest = option === fastest;

            return (
              <motion.div
                key={`${option.platform}-${idx}`}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isRecommended
                    ? 'border-blue-200 bg-blue-50/40'
                    : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-[#F9FAFB]'
                }`}
                onClick={() => onAddToCart?.(option)}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <PlatformBadge platform={option.platform} />
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-[#111827] block truncate">
                      {option.quantity || 'Standard'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {isCheapest && options.length > 1 && (
                        <span className="text-[9px] sm:text-[10px] text-[#16A34A] font-semibold">
                          Cheapest
                        </span>
                      )}
                      {isFastest && options.length > 1 && (
                        <span className="text-[9px] sm:text-[10px] text-[#2563EB] font-semibold">
                          Fastest
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  {option.price > 0 ? (
                    <p className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
                      ₹{option.price}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-[#9CA3AF]">
                      View price
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs font-medium text-[#9CA3AF] flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] live-dot" />
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
