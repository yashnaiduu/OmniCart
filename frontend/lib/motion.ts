/**
 * LUXON Motion System — Shared spring configs & easing curves
 * Based on animation.md: battle-tested patterns from YouTube, Swiggy, Twitter, Amazon
 */

import type { Variants, Transition } from 'framer-motion';

/* ── 3-Tier Speed System ── */
export const MOTION_SPEEDS = {
  micro: { duration: 0.08, ease: [0.4, 0, 0.2, 1] as const },
  macro: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const },
  cinematic: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const },
} as const;

/* ── Named Spring Configs ── */
export const SPRING = {
  default: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 1 },
  snappy: { type: 'spring' as const, stiffness: 500, damping: 35, mass: 0.8 },
  wobbly: { type: 'spring' as const, stiffness: 200, damping: 15, mass: 1.2 },
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 },
  elastic: { type: 'spring' as const, stiffness: 400, damping: 12, mass: 0.5 },
} satisfies Record<string, Transition>;

/* ── Stagger Constants ── */
export const STAGGER_DELAY = 0.05; // 50ms per child
export const MAX_STAGGER_ITEMS = 8;  // Cap at 400ms total

/* ── Variant Factories ── */

/** Container that staggers its children in */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0.05,
    },
  },
};

/** Fade-up child item */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_SPEEDS.macro.duration,
      ease: MOTION_SPEEDS.macro.ease,
    },
  },
};

/** Card hover variants: lift 8px + violet glow */
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)',
    transition: SPRING.default,
  },
};

/** Badge entrance: spin-in with elastic spring */
export const badgeEntrance: Variants = {
  hidden: { scale: 0, rotate: -180 },
  show: {
    scale: 1,
    rotate: 0,
    transition: {
      ...SPRING.elastic,
      delay: 0.4,
    },
  },
};

/** Modal two-stage entrance */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const drawerVariants: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { delay: 0.1, ...SPRING.default },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2, ease: MOTION_SPEEDS.macro.ease },
  },
};
