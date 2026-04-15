# 🧠 FRONTEND FIX PROMPT (STRICT — USE THIS TO FIX CURRENT UI)

---

# 🎯 OBJECTIVE

You are given an **existing grocery search page UI** that is:

* functionally correct
* visually poor
* not scalable
* not aligned with product UX standards

Your task is to **refactor and fix the UI completely** while preserving functionality.

---

# 🚫 DO NOT DO THESE (STRICT)

---

❌ Do NOT redesign the product concept
❌ Do NOT add new features
❌ Do NOT add marketing text or taglines
❌ Do NOT add emojis anywhere
❌ Do NOT add “AI-powered” labels
❌ Do NOT change backend logic or API contracts

---

# ✅ YOUR TASK

---

Refactor the existing search page to:

1. Fix layout issues
2. Improve visual hierarchy
3. Make it responsive (mobile + desktop)
4. Convert it into a **shopping-style UI (not dashboard)**
5. Follow Blinkit-style browsing + Apple-level design

---

# 🔥 CRITICAL PROBLEMS YOU MUST FIX

---

## 1. Layout is too narrow

Current issue:

* Content is centered in a small column
* Large empty space on sides

---

## FIX:

Use full-width container:

```tsx
<div className="w-full min-h-screen bg-[#F9FAFB]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
```

---

---

## 2. Search bar is weak and not dominant

---

## FIX:

* Make search sticky
* Increase height
* Make it primary focus

---

---

## 3. UI is list-heavy (bad UX)

---

Current:

* long vertical list of results
* repetitive rows

---

## FIX:

Split UI into 3 layers:

---

### LAYER 1: PRIMARY DECISION CARD

Show best option clearly at top

---

### LAYER 2: HORIZONTAL PRODUCT SECTIONS

Use scrollable cards:

* Best price
* Fastest
* Recommended

---

### LAYER 3: DETAILED LIST (existing UI)

Keep your current list but:

* move it below
* reduce visual weight

---

---

## 4. No visual hierarchy

---

## FIX:

Use:

* spacing (`space-y-6`, `space-y-8`)
* card grouping
* section titles

---

---

## 5. Cards look like table rows

---

## FIX:

Convert each result into:

```tsx
bg-white rounded-2xl p-4 shadow-sm
```

* separate blocks
* clear spacing

---

---

## 6. Too much clutter

---

## REMOVE:

* “Parsed: …” text
* excessive platform tags at top
* duplicate labels
* unnecessary badges

---

---

## 7. No primary user focus

---

## FIX:

Always show:

👉 “Best option” card at top

---

---

# 🎨 DESIGN RULES (MANDATORY)

---

## Colors

* Background: `#F9FAFB`
* Cards: `white`
* Text primary: `#111827`
* Text secondary: `#6B7280`

---

## Borders

* Avoid heavy borders
* Use subtle borders only if needed

---

## Shadows

* Default: `shadow-sm`
* Hover: `hover:shadow-md`

---

## Radius

* Use ONLY:

  * `rounded-xl`
  * `rounded-2xl`

---

---

# 📱 RESPONSIVENESS RULES

---

## Mobile:

* Single column
* Horizontal scroll sections
* Large touch targets

---

## Desktop:

* Centered container
* Wider spacing
* Maintain horizontal sections

---

---

# ⚡ INTERACTION RULES

---

* Smooth transitions (`duration-200`)
* No flashy animations
* No popups unless necessary

---

---

# 🧠 CONTENT RULES

---

Use ONLY functional text:

✅ “Search groceries”
✅ “Add”
✅ “Price”

---

DO NOT USE:

❌ “Discover amazing deals”
❌ “Smart shopping experience”

---

---

# 🔌 DATA STRUCTURE (DO NOT CHANGE)

---

Each product:

```ts
{
  id: string
  name: string
  price: number
  platform: string
  eta: number
  quantity: string
}
```

---

---

# 🧪 FINAL VALIDATION CHECK

---

Before finishing, verify:

---

✔ Layout uses full width properly
✔ Search bar is visually dominant
✔ Page is NOT a vertical list anymore
✔ There is a clear “best option” section
✔ Horizontal product sections exist
✔ UI looks like a real product (not demo)
✔ No fluff text or unnecessary elements

---

---

# 🏁 FINAL RULE

> Do NOT make it “fancy”
> Make it **clean, structured, and usable**

---

# 🚀 EXPECTED OUTPUT

* Refactored search page
* Clean layout
* Proper hierarchy
* Blinkit-style browsing
* Apple-level visual quality

---
