# 🎨 APPLE-LEVEL UI + COLOR SYSTEM (STRICT DESIGN PROMPT ADDON)

---

# 🎯 OBJECTIVE

Design a **premium, Apple-inspired UI** that feels:

* clean
* minimal
* calm
* high-quality
* effortless

---

# 🧠 CORE DESIGN PHILOSOPHY

---

## RULE 1: LESS IS MORE

* Avoid visual noise
* Avoid too many colors
* Avoid heavy borders

---

## RULE 2: DEPTH THROUGH SUBTLETY

* Use shadows softly
* Use contrast lightly
* Use spacing for hierarchy

---

## RULE 3: FUNCTION FIRST

* Every color must have meaning
* Every element must serve a purpose

---

# 🎨 COLOR SYSTEM (STRICT TOKENS)

---

## 🧱 BACKGROUND LAYERS

---

### Primary Background

```css
bg-[#F9FAFB]
```

👉 Very light gray (NOT pure white)

---

### Secondary Background (cards, sections)

```css
bg-white
```

---

### Elevated Surface (hover / active)

```css
bg-[#F3F4F6]
```

---

---

## 🔤 TEXT COLORS

---

### Primary Text

```css
text-[#111827]
```

👉 Deep gray (not pure black)

---

### Secondary Text

```css
text-[#6B7280]
```

👉 Subtle gray

---

### Muted Text

```css
text-[#9CA3AF]
```

👉 Low emphasis

---

---

## 🎯 PRIMARY ACCENT COLOR

---

### Main Accent (Apple-like Blue)

```css
#2563EB
```

Use for:

* active states
* highlights
* focus rings

---

### Hover Variant

```css
#1D4ED8
```

---

---

## 🟢 SUCCESS / ACTION COLOR (ADD BUTTON)

---

```css
#16A34A
```

Use for:

* ADD buttons
* positive actions

---

### Light Background

```css
bg-green-50
```

---

---

## 🔴 ERROR COLOR

---

```css
#DC2626
```

Use sparingly.

---

---

# 🧩 COMPONENT COLOR RULES

---

## 🧱 CARDS

---

### Default

```css
bg-white shadow-sm
```

---

### Hover

```css
hover:shadow-md
```

---

### Border (optional, subtle)

```css
border border-gray-100
```

---

---

## 🔘 BUTTONS

---

### Primary Button

```css
bg-[#111827] text-white
hover:bg-[#1F2937]
```

---

### Secondary Button

```css
bg-gray-100 text-gray-800
hover:bg-gray-200
```

---

### Add Button (Blinkit-style)

```css
border border-green-600 text-green-600
hover:bg-green-50
```

---

---

## 🔍 SEARCH BAR

---

### Background

```css
bg-[#F3F4F6]
```

---

### Focus State

```css
focus:ring-2 focus:ring-blue-500
```

---

---

# 🌫️ SHADOW SYSTEM (VERY IMPORTANT)

---

## Light Shadow (default)

```css
shadow-sm
```

---

## Medium (hover)

```css
hover:shadow-md
```

---

## NEVER USE

❌ heavy shadows
❌ shadow-lg everywhere

---

---

# 📏 BORDER RADIUS SYSTEM

---

## Standard

```css
rounded-xl
```

---

## Primary UI Elements

```css
rounded-2xl
```

---

## Rule

* Keep consistency
* Do NOT mix too many radii

---

---

# ✨ INTERACTION STATES

---

## Hover

* Slight shadow increase
* Slight brightness change

---

## Active

* Slight scale down

```css
active:scale-95
```

---

## Focus

```css
focus:ring-2 focus:ring-blue-500
```

---

---

# 🎞️ ANIMATION SYSTEM

---

## Duration

```plaintext
200ms – 300ms
```

---

## Types

* fade
* scale
* slide

---

## Example

```tsx
transition-all duration-200 ease-in-out
```

---

---

# 📱 MOBILE-FIRST COLOR BEHAVIOR

---

## Mobile

* Higher contrast
* Clear touch targets

---

## Desktop

* More whitespace
* Softer contrast

---

---

# ⚠️ STRICT DESIGN RULES

---

❌ No bright/random colors
❌ No gradients everywhere
❌ No heavy borders
❌ No inconsistent spacing
❌ No dark UI (MVP = light only)

---

---

# 🧠 VISUAL HIERARCHY RULE

---

Use ONLY:

1. Size
2. Weight
3. Spacing
4. Subtle color

---

NOT:

* loud colors
* heavy borders

---

---

# 🏁 FINAL DESIGN RULE

> If it looks “designed” → it’s wrong
> If it looks effortless → it’s correct

---

# 🚀 EXPECTED RESULT

The UI should feel like:

* Apple Store app
* Notion
* Stripe dashboard

---

Clean. Fast. Premium.

---
