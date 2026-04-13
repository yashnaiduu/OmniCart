# 🖥️ 11_FRONTEND_SPEC.md (PRODUCTION / APPLE-LEVEL UX)

---

# 1. 🎯 PURPOSE

Defines:

* Frontend architecture
* Component structure
* State management
* API integration
* UX flows

---

# 2. ⚙️ TECH STACK (STRICT)

---

## Framework

* Next.js 14 (App Router)

---

## Language

* TypeScript

---

## Styling

* Tailwind CSS
* shadcn/ui

---

## State Management

| Type         | Tool        |
| ------------ | ----------- |
| Server state | React Query |
| Client state | Zustand     |

---

## Animations

* Framer Motion ONLY

---

# 3. 📁 PROJECT STRUCTURE

---

```plaintext
/frontend
  /app
    /home
    /search
    /collections
    /dashboard
    /profile
  /components
    /ui
    /search
    /cards
    /lists
  /store
  /lib
  /hooks
```

---

# 4. 🧩 CORE PAGES

---

## 4.1 Home (Feed)

---

### Purpose:

* Personalized experience
* Show value immediately

---

### Components:

* Refill suggestions
* Deals
* Price drops
* Recommendations

---

---

## 4.2 Search / Input Page (MOST IMPORTANT)

---

### Features:

* Real-time suggestions
* Voice input (future)
* AI expansion

---

### Flow:

```plaintext
User types →
Suggestions appear →
Select →
Add to cart
```

---

---

## 4.3 Collections Page

---

### Features:

* Folder system
* Add/edit items
* Bulk actions

---

---

## 4.4 Comparison Page

---

### Purpose:

Show results from all platforms

---

### Components:

* Product cards
* Platform comparison
* “Best option” highlight

---

---

## 4.5 Savings Dashboard

---

### Features:

* money saved
* spending trends
* insights

---

---

## 4.6 Profile Page

---

### Features:

* preferences
* budget
* subscriptions

---

# 5. 🔄 STATE MANAGEMENT

---

## React Query (Server State)

---

```ts
const { data, isLoading } = useQuery({
  queryKey: ["search", query],
  queryFn: fetchResults
});
```

---

## Zustand (Client State)

---

```ts
const useStore = create((set) => ({
  cart: [],
  addItem: (item) => set((state) => ({
    cart: [...state.cart, item]
  }))
}));
```

---

# 6. 🔌 API INTEGRATION

---

## Rules:

* All calls via API Gateway
* Use Axios or Fetch
* Handle errors gracefully

---

## Example

```ts
async function search(query) {
  const res = await fetch("/api/v1/search", {
    method: "POST",
    body: JSON.stringify({ query })
  });

  return res.json();
}
```

---

# 7. 🎨 UI COMPONENT SYSTEM

---

## Base Components

* Button
* Card
* Input
* Modal
* List

---

## Rules:

* Rounded corners (2xl)
* Soft shadows
* Consistent spacing

---

# 8. ⚡ PERFORMANCE OPTIMIZATION

---

* Lazy loading
* Code splitting
* Debounced input

---

## Example

```ts
const debouncedSearch = debounce(search, 300);
```

---

# 9. 📱 RESPONSIVENESS

---

* Mobile-first
* Breakpoints:

  * sm
  * md
  * lg

---

# 10. ⚠️ ERROR HANDLING

---

## UI States:

* Loading
* Empty
* Error

---

## Example

```tsx
if (error) return <ErrorState />;
```

---

# 11. 🔄 OFFLINE SUPPORT (MVP)

---

* Store collections in localStorage
* Sync when online

---

# 12. 🧠 UX PRINCIPLES (APPLE-LEVEL)

---

* Minimal UI
* No clutter
* Instant feedback
* One primary action per screen

---

# 13. 🧪 EDGE CASES

---

## Case 1: Slow API

→ show skeleton loaders

---

## Case 2: No results

→ show helpful suggestions

---

## Case 3: Network error

→ retry button

---

# 14. 💸 COST-FREE STRATEGY

---

* Vercel free tier
* Avoid heavy assets
* Optimize bundle size

---

# 🏁 FINAL RULE

> UI must feel instant, even if backend is slow.
> Perception > reality.

---
