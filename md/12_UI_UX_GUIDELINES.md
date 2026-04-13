# 🎨 12_UI_UX_GUIDELINES.md (APPLE-LEVEL DESIGN SYSTEM)

---

# 1. 🎯 PURPOSE

Defines the **design system and interaction principles** for OmniCart.

This ensures:

* Visual consistency
* Premium feel
* High usability
* Low cognitive load

---

# 2. 🧠 DESIGN PHILOSOPHY

---

## Core Principles

* **Clarity over creativity**
* **Function over decoration**
* **Whitespace over clutter**
* **Speed over animation overload**

---

## Inspiration

* Apple
* Notion
* Stripe

---

# 3. 📏 SPACING SYSTEM

---

## Base Unit: 4px

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |

---

## Rules

* Always use multiples of 4
* Maintain consistent padding

---

# 4. 🔤 TYPOGRAPHY SYSTEM

---

## Font

* Inter (primary)

---

## Scale

| Type  | Size |
| ----- | ---- |
| H1    | 32px |
| H2    | 24px |
| H3    | 20px |
| Body  | 16px |
| Small | 14px |

---

## Rules

* Max 2 font weights per screen
* Strong hierarchy

---

# 5. 🎨 COLOR SYSTEM

---

## Base

* Background: #FFFFFF
* Text Primary: #111827
* Text Secondary: #6B7280

---

## Accent

* Primary: Blue (#3B82F6)
* Success: Green (#10B981)
* Error: Red (#EF4444)

---

## Rules

* Avoid too many colors
* Use color for meaning

---

# 6. 🧩 COMPONENT DESIGN RULES

---

## Buttons

* Rounded: 2xl
* Padding: px-4 py-2
* Hover: subtle scale

---

## Cards

* Soft shadow
* Rounded corners
* Padding: md

---

## Inputs

* Clear borders
* Focus highlight
* Placeholder text

---

# 7. 🎞️ ANIMATION SYSTEM

---

## Library

* Framer Motion ONLY

---

## Duration

* 200–300ms

---

## Types

* Fade
* Slide
* Scale

---

## Rules

* No unnecessary animation
* Must improve UX

---

# 8. ⚡ INTERACTION DESIGN

---

## Feedback

* Instant visual response
* Loading states

---

## Micro-interactions

* Button click → scale
* Hover → subtle shadow

---

# 9. 📱 RESPONSIVE DESIGN

---

## Breakpoints

* Mobile first
* Tablet
* Desktop

---

## Rules

* No horizontal scroll
* Flexible layouts

---

# 10. 🧠 UX RULES

---

## Rule 1: One primary action per screen

---

## Rule 2: Reduce decision fatigue

---

## Rule 3: Show value immediately

---

## Rule 4: Never confuse user

---

# 11. ⚠️ ERROR STATES

---

## Must include:

* Clear message
* Retry option

---

## Example

```plaintext
"Something went wrong. Try again."
```

---

# 12. 🔄 LOADING STATES

---

## Types:

* Skeleton loaders
* Spinners

---

## Rule:

* Never leave blank screen

---

# 13. 🧪 EDGE CASE UX

---

## No data

→ Show suggestions

---

## Slow network

→ Show progress

---

## Empty collections

→ Show onboarding tips

---

# 14. 🧠 PERCEPTION OPTIMIZATION

---

* Show results progressively
* Avoid long waits
* Use optimistic UI

---

# 15. 💸 COST-FREE DESIGN TOOLS

---

* Figma (free tier)
* Tailwind UI (open-source components)

---

# 🏁 FINAL RULE

> If user has to think, design has failed.
> Everything must feel obvious.

---
