'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PriceFlipProps {
  price: number;
  className?: string;
}

export function PriceFlip({ price, className = '' }: PriceFlipProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={price}
        initial={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: 10, opacity: 0, filter: 'blur(4px)' }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className={`inline-block ${className}`}
      >
        ₹{price}
      </motion.span>
    </AnimatePresence>
  );
}
