'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store';
import { PlatformBadge } from './ProductCard';
import { overlayVariants, drawerVariants, SPRING } from '@/lib/motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, clearCart, totalCost } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[#0A0B0D]/95 backdrop-blur-2xl border-l border-white/5 z-50 flex flex-col safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight font-heading">Cart</h2>
                <p className="text-xs text-gray-500 font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-luxon-sm hover:bg-red-500/10 transition-all duration-200"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-luxon-sm bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all duration-200 text-sm border border-white/5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white font-semibold font-heading">No items in cart</p>
                  <p className="text-gray-500 text-sm mt-1">Add items from search results</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.normalizedName}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={SPRING.default}
                      className="bg-white/[0.03] rounded-luxon-sm p-4 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white capitalize truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <PlatformBadge platform={item.selectedOption.platform} isWinner />
                            <span className="text-[10px] text-gray-500 font-medium">
                              {item.selectedOption.metadata?.weight || 'Standard'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                              {item.selectedOption.delivery.eta} min
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-2 shrink-0">
                          {item.selectedOption.price.current > 0 ? (
                            <p className="text-lg font-bold text-white font-mono tabular-nums">₹{item.selectedOption.price.current}</p>
                          ) : (
                            <p className="text-sm text-gray-500 font-medium">View price</p>
                          )}
                          <button
                            onClick={() => removeItem(item.normalizedName)}
                            className="text-[10px] font-semibold text-red-400 hover:text-red-300 mt-1 transition-all duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 px-5 sm:px-6 py-4 bg-[#0A0B0D]/80 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider font-heading">Total</span>
                  <span className="text-2xl font-bold text-white font-mono tabular-nums">₹{totalCost()}</span>
                </div>
                <p className="text-[10px] text-gray-600 text-center">
                  Final price at checkout on respective platform.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
