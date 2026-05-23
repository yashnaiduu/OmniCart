# OmniCart Design System Prompt

Create a comprehensive design system for **OmniCart** that establishes a distinctive, premium visual identity rivaling Swiggy's playful energy, Zepto's speed-focused minimalism, and Blinkit's bold simplicity—but with its own unique character.

## Brand Essence & Philosophy

**OmniCart is the "smart aggregator"**—a power tool for informed consumers who value transparency, speed, and intelligence over flashy marketing. The design should communicate:

- **Clarity through complexity**: Distilling chaos (multiple platforms, fluctuating prices) into calm, decisive interfaces
- **Premium intelligence**: Not a discount bazaar, but a sophisticated price optimization engine
- **Trust through transparency**: Raw data made beautiful, comparisons made effortless
- **Speed meets substance**: Fast interactions, but thoughtful decision-making

---

## Core Design Language: **LUXON (Aether UI)**

Evolve the existing LUXON foundation into a fully realized design system:

### Visual Pillars

**1. The Obsidian Canvas**
- Deep, layered dark interfaces (#0A0B0D to #12141A gradient bases)
- Not flat black—use subtle noise textures and depth gradations
- Background should feel like polished volcanic glass, not empty void

**2. Lightwells (Radial Under-glows)**
- Strategic use of soft-tech radial gradients beneath key UI elements
- Colors: Electric violet (#8B5CF6), Cyan accent (#06B6D4), Amber alert (#F59E0B)
- Purpose: Draw attention to price savings, fastest delivery, optimal choices
- Implementation: `radial-gradient(circle at center, color/20% 0%, transparent 70%)`

**3. Glassmorphic Hierarchy**
- Product cards, comparison panels, and modals use layered glass surfaces
- `backdrop-filter: blur(20px)` with subtle borders (`border: 1px solid rgba(255,255,255,0.1)`)
- Create depth through elevation: hover states lift cards with increased blur + glow

**4. Asymmetrical Bi-Radii (rounded-luxon)**
- Signature border-radius system: `border-radius: 24px 8px 24px 8px` (alternating corners)
- Larger elements: `32px 12px 32px 12px`
- Buttons/chips: `16px 6px 16px 6px`
- Creates organic, gem-cut aesthetic—like faceted crystals

**5. Liquid Physics Animations**
- Framer Motion spring configs: `{ type: "spring", stiffness: 300, damping: 25 }`
- Magnetic button interactions: buttons "pull" cursor within 40px proximity
- Price update animations: numbers morph with elastic easing
- Cart additions: items "splash" into cart with ripple effects

---

## Unique Differentiators (Your "Swiggy Orange" Moments)

### 1. **The Prism Effect** (Signature Visual Device)
- When comparing prices across platforms, render a **spectral prism refraction** between cards
- Implementation: SVG gradient meshes or CSS `linear-gradient` with 5+ platform brand colors blending
- Symbolizes: "All options refracted through OmniCart's lens"

### 2. **Smart Badges with Micro-Interactions**
- "Cheapest", "Fastest", "Best Value" badges aren't static labels
- Animate with:
  - Pulse glow on appearance
  - Particle trails when prices update
  - Confetti burst when achieving budget goals
- Use semantic colors: Green (#10B981) = savings, Blue (#3B82F6) = speed, Purple (#8B5CF6) = best value

### 3. **Adaptive Color Intelligence**
- Platform logos displayed in **monochrome** (desaturated, 30% opacity) by default
- When a platform wins a category (cheapest/fastest), its logo **blooms into full color** with a subtle halo
- Creates visual hierarchy without overwhelming with brand colors

### 4. **The Comparison Matrix Grid**
- Side-by-side product cards arranged in a **responsive masonry grid**
- On hover, non-hovered cards **fade to 40% opacity and blur slightly**
- Selected platform expands width by 10% with spring animation
- Price differentials shown as **color-coded delta values** (+₹20 in red, -₹15 in green)

### 5. **Delivery ETA Visualizer**
- Don't just show "15 mins"—show a **radial countdown timer** as a micro-progress ring
- Color shifts from cyan (fast) → amber (medium) → red (slow) based on comparative speed
- Animates on page load with staggered delays per platform

---

## Typography System

**Primary Font**: **Inter** (for UI/data) — Clean, neutral, designed for digital interfaces  
**Accent Font**: **Space Grotesk** (for headings/branding) — Geometric, tech-forward, distinctive  
**Monospace**: **JetBrains Mono** (for prices/numbers) — Tabular figures, precise alignment

**Scale**:
- Hero (Product names): 28px / 700 weight / -0.5px letter-spacing
- Price (primary): 32px / 800 weight / Monospace / Tabular nums
- Body: 16px / 400 weight / 1.6 line-height
- Captions: 13px / 500 weight / 0.3px letter-spacing / UPPERCASE

---

## Color Palette (Beyond Obsidian)

**Functional Colors**:
- Success Green: `#10B981` (savings, in-stock)
- Alert Amber: `#F59E0B` (price increases, low stock)
- Error Red: `#EF4444` (out of stock, delivery unavailable)
- Info Cyan: `#06B6D4` (fastest delivery, new features)
- Premium Violet: `#8B5CF6` (best value, AI recommendations)

**Platform Identity (Muted Versions)**:
- Swiggy: `#FC8019` → `#FC801940` (muted)
- Blinkit: `#F8CB46` → `#F8CB4640`
- Zepto: `#8B4CFC` → `#8B4CFC40`
- BigBasket: `#84C225` → `#84C22540`
- Amazon: `#FF9900` → `#FF990040`

---

## Component Specifications

### Product Comparison Card
```
Structure:
┌─────────────────────────────────┐
│ [Platform Logo - Monochrome]    │
│                                  │
│ Product Image (rounded-luxon)   │
│ ↓ with subtle glow if cheapest  │
│                                  │
│ Product Name (truncate 2 lines) │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ ₹299 ₹249 (-17%) ← Price logic │
│                                  │
│ [🏆 Cheapest] [⚡ 12 mins]      │
│                                  │
│ [Add to Cart - Magnetic Button] │
└─────────────────────────────────┘

Interactions:
- Hover: Lift 8px, glow intensifies
- Click: Ripple effect from click point
- Add to cart: Item "flies" to cart icon with trail
```

### Smart Cart Summary Panel
- Floating bottom sheet (mobile) / Sidebar (desktop)
- Shows **optimized cart**: "Buy X from Blinkit, Y from Zepto = Save ₹47"
- **Toggle view**: "Cheapest Total" vs "Fastest Delivery" vs "Single Platform"
- Animated savings counter when items added

### Search Bar (Hero Element)
- **Centered, oversized** (desktop: 600px width, 64px height)
- Glassmorphic with thick lightwell glow
- Autocomplete dropdown with **product images + price previews**
- Voice search button with pulsing animation
- Search icon morphs into loading spinner during queries

---

## Motion & Interaction Principles

1. **Spring-first animations**: No linear easing—everything uses spring physics
2. **Stagger reveals**: Cards appear sequentially (50ms delay each) on load
3. **Magnetic attraction**: Buttons/CTAs attract cursor within 40px radius
4. **Price morph**: Number changes animate digit-by-digit with flip effect
5. **Gesture-friendly**: Swipe cards horizontally on mobile, pinch to compare

---

## Mobile-First Considerations

- Bottom navigation with **haptic feedback** on tab switches
- **Swipe-to-compare**: Horizontal scroll through platform cards with snap points
- **Quick actions**: Long-press product for instant add-to-favorites
- **Floating action button**: Large "Compare Cart" button (64px) with pulsing glow

---

## Accessibility & Usability

- **WCAG AAA contrast** on all text (against dark backgrounds)
- **Focus indicators**: 3px cyan outline with 4px offset
- **Reduced motion mode**: Disable springs/blurs for users who prefer it
- **Screen reader**: All price comparisons announced as "Product X costs ₹249 on Blinkit, ₹15 cheaper than Zepto"

---

## Inspiration Reference (Not to Copy, But to Match Caliber)

- **Swiggy**: Playful micro-interactions, warm personality
- **Zepto**: Speed-obsessed minimalism, purple energy
- **Blinkit**: Bold yellow contrast, instant gratification cues
- **Linear**: Clean task management, keyboard-first UX
- **Stripe**: Premium fintech aesthetics, trustworthy data viz
- **Raycast**: Command palette, smart suggestions, productivity-focused

**OmniCart should feel like**: *The "Bloomberg Terminal" of grocery shopping—powerful, data-dense, but elegantly designed for speed and precision.*

---

## Implementation Checklist for Designer/Developer

- [ ] Create Figma component library with all LUXON primitives
- [ ] Build Tailwind config with custom `rounded-luxon`, lightwell utilities
- [ ] Implement Framer Motion variants for all card states
- [ ] Design empty states with playful illustrations (not generic)
- [ ] Create loading skeletons that match card asymmetry
- [ ] Build interactive prototype showing magnetic button demo
- [ ] Document all animation spring constants
- [ ] Export platform logos in muted + full-color SVG variants

