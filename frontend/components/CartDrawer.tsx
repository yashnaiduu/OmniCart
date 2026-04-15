'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store';
import { PlatformBadge } from './ProductCard';

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
          {/* Backdrop — subtle, per design.md */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Drawer — clean white, shadow-sm only */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-sm border-l border-gray-100 z-50 flex flex-col safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#111827] tracking-tight">Your Cart</h2>
                <p className="text-xs text-[#9CA3AF] font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-[#DC2626] hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-3xl mb-4">
                    🛒
                  </div>
                  <p className="text-[#111827] font-semibold">Cart is empty</p>
                  <p className="text-[#9CA3AF] text-sm mt-1">Add items from search results</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.normalizedName}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="bg-[#F9FAFB] rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#111827] capitalize truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <PlatformBadge platform={item.selectedOption.platform} />
                            <span className="text-[10px] text-[#9CA3AF] font-medium">
                              {item.selectedOption.quantity || 'Standard'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-[#6B7280] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] live-dot" />
                              {item.selectedOption.eta_minutes} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {item.selectedOption.price > 0 ? (
                            <p className="text-lg font-bold text-[#111827]">₹{item.selectedOption.price}</p>
                          ) : (
                            <p className="text-sm text-[#9CA3AF] font-medium">View price</p>
                          )}
                          <button
                            onClick={() => removeItem(item.normalizedName)}
                            className="text-[10px] font-semibold text-[#DC2626] hover:text-red-700 mt-1 transition-all duration-200"
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
              <div className="border-t border-gray-100 px-5 sm:px-6 py-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-bold text-[#111827]">₹{totalCost()}</span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] text-center">
                  Prices sourced from publicly available data. Final price at checkout on respective platform.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
