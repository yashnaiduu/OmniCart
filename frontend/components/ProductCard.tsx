'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductOption } from '@/lib/api';
import { SPRING, badgeEntrance } from '@/lib/motion';
import { PriceFlip } from './PriceFlip';

/* Platform config — muted versions per designinsp.md */
const platformConfig: Record<string, { color: string; mutedColor: string; label: string }> = {
  blinkit: { color: '#F8CB46', mutedColor: 'rgba(248, 203, 70, 0.3)', label: 'Blinkit' },
  zepto: { color: '#8B4CFC', mutedColor: 'rgba(139, 76, 252, 0.3)', label: 'Zepto' },
  instamart: { color: '#FC8019', mutedColor: 'rgba(252, 128, 25, 0.3)', label: 'Instamart' },
  bigbasket: { color: '#84C225', mutedColor: 'rgba(132, 194, 37, 0.3)', label: 'BigBasket' },
  amazonfresh: { color: '#FF9900', mutedColor: 'rgba(255, 153, 0, 0.3)', label: 'Amazon Fresh' },
};

const defaultPlatform = { color: '#64748B', mutedColor: 'rgba(100, 116, 139, 0.3)', label: 'Unknown' };

export function PlatformBadge({ platform, isWinner = false }: { platform: string; isWinner?: boolean }) {
  const config = platformConfig[platform] || defaultPlatform;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-luxon-sm text-[11px] font-semibold tracking-wide transition-all duration-300 font-heading"
      style={{
        background: isWinner ? config.mutedColor : 'rgba(255,255,255,0.05)',
        color: isWinner ? config.color : 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        borderColor: isWinner ? config.mutedColor : 'rgba(255,255,255,0.05)',
      }}
    >
      {config.label}
    </span>
  );
}

/* Product image component */
function ProductImage({
  src,
  alt,
  size = 'md',
}: {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-28 h-28 sm:w-32 sm:h-32',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  };

  return src ? (
    <div
      className={`${sizeClasses[size]} rounded-luxon-md bg-white/5 border border-white/5 p-2 flex items-center justify-center shrink-0 overflow-hidden`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-2xl font-bold text-gray-600">${alt.charAt(0).toUpperCase()}</span>`;
          }
        }}
      />
    </div>
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-luxon-md bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 flex items-center justify-center shrink-0`}
    >
      <span className="text-2xl font-bold text-gray-600">
        {alt.charAt(0).toUpperCase()}
      </span>
    </div>
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
  const [addedIdx, setAddedIdx] = useState<number | null>(null);

  if (!options || options.length === 0) return null;

  const cheapest = options.reduce(
    (min, o) => (o.price.current < min.price.current ? o : min),
    options[0],
  );
  const fastest = options.reduce(
    (min, o) => (o.delivery.eta < min.delivery.eta ? o : min),
    options[0],
  );

  const productImageUrl = options.find((o) => o.imageUrl)?.imageUrl;

  const handleAdd = (option: ProductOption, idx: number) => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setAddedIdx(idx);
    onAddToCart?.(option);
    setTimeout(() => setAddedIdx(null), 1000);
  };

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={{
        rest: { scale: 1, y: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
        hover: {
          scale: 1.03,
          y: -8,
          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.25)',
          transition: SPRING.default,
        },
      }}
      className="luxon-glass p-5 sm:p-6 relative rounded-luxon-lg overflow-hidden group"
    >
      {/* Header — large product image */}
      <div className="flex flex-col items-center mb-5 relative">
        <ProductImage src={productImageUrl} alt={name} size="lg" />
        <div className="mt-3 text-center w-full">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white capitalize tracking-tight leading-tight line-clamp-2 font-heading">
              {options[0]?.normalized_name || name}
            </h3>
            {recommended && (
              <motion.span
                variants={badgeEntrance}
                initial="hidden"
                animate="show"
                className="shrink-0 text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-luxon-sm font-semibold font-heading"
              >
                Top Pick
              </motion.span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1 truncate">{name}</p>
        </div>
      </div>

      {/* Platform options */}
      <div className="space-y-2">
        {options
          .sort((a, b) => a.price.current - b.price.current)
          .map((option, idx) => {
            const isCheapest = option === cheapest;
            const isFastest = option === fastest;
            const isWinner = isCheapest || isFastest;
            const isAdded = addedIdx === idx;

            return (
              <motion.div
                key={`${option.platform}-${idx}`}
                whileTap={{ scale: 0.96 }}
                transition={SPRING.snappy}
                className={`relative flex items-center justify-between p-3 sm:p-4 rounded-luxon-sm border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isCheapest
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/5'
                }`}
                onClick={() => handleAdd(option, idx)}
              >
                {/* Success ripple overlay */}
                <AnimatePresence>
                  {isAdded && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 bg-white/20 rounded-full origin-center pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 relative z-10">
                  {option.imageUrl && (
                    <div className="w-10 h-10 rounded-luxon-sm bg-white/5 border border-white/5 p-0.5 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={option.imageUrl}
                        alt={option.platform}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <PlatformBadge platform={option.platform} isWinner={isWinner} />
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-200 block truncate">
                      {option.metadata?.weight || 'Standard'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {isCheapest && options.length > 1 && (
                        <motion.span
                          variants={badgeEntrance}
                          initial="hidden"
                          animate="show"
                          className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold font-heading"
                        >
                          🏆 Cheapest
                        </motion.span>
                      )}
                      {isFastest && options.length > 1 && (
                        <span className="text-[9px] sm:text-[10px] text-cyan-400 font-semibold font-heading">
                          ⚡ Fastest
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2 relative z-10">
                  {option.price.current > 0 ? (
                    <p className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono tabular-nums">
                      <PriceFlip price={option.price.current} />
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-500">
                      View price
                    </p>
                  )}
                  <div className="flex items-center gap-1 justify-end h-4">
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.span
                          key="added"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={SPRING.elastic}
                          className="text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1"
                        >
                          <span className="text-xs">✓</span> Added
                        </motion.span>
                      ) : (
                        <motion.p
                          key="eta"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] sm:text-xs font-medium text-gray-500 flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                          {option.delivery.eta} min
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
