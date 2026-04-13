# 🔌 08_CONNECTORS_SPEC.md (PRODUCTION + COST-FREE MVP)

---

# 1. 🎯 PURPOSE

Defines how OmniCart retrieves **real-time product + pricing data** from platforms like:

* Blinkit
* Instamart
* Zepto
* BigBasket

---

# 2. ⚠️ CRITICAL REALITY

These platforms:

* ❌ Do NOT provide public APIs
* ❌ Actively block bots
* ❌ Use dynamic frontend systems

---

# 3. 🧠 DESIGN PRINCIPLE

> Each platform = **independent connector service**

---

## Architecture

```plaintext
Aggregation Service
   ↓
Connector Services (parallel)
   ↓
Platform APIs / Web
```

---

# 4. ⚙️ CONNECTOR INTERFACE (STRICT)

```ts
interface Connector {
  search(query: string, lat: number, lng: number): Promise<Product[]>;
}
```

---

# 5. 🟢 MVP (COST-FREE STRATEGY)

---

## Method 1: Reverse Engineered APIs (BEST)

### Steps:

1. Open platform (e.g. Blinkit)
2. Search "milk"
3. Open DevTools → Network tab
4. Identify API request
5. Copy request

---

### Example (conceptual)

```http
GET /api/search?q=milk&lat=12.97&lng=77.75
```

---

### Implementation

```ts
async function searchBlinkit(query, lat, lng) {
  const res = await fetch(`https://api.blinkit.com/search?q=${query}&lat=${lat}&lng=${lng}`, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const data = await res.json();

  return data.products.map(p => ({
    name: p.name,
    price: p.price,
    quantity: p.size,
    platform: "blinkit"
  }));
}
```

---

## Method 2: Playwright (Fallback)

Use when:

* API blocked
* dynamic rendering required

---

### Example

```ts
import { chromium } from "playwright";

async function scrape(query) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://blinkit.com");
  await page.fill("input", query);

  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".product")).map(p => ({
      name: p.innerText
    }));
  });

  return results;
}
```

---

# 6. ⚡ PERFORMANCE RULES

* Max latency per connector: **300ms**
* Must run in parallel
* Must return partial results

---

# 7. 🔁 RETRY STRATEGY

```ts
retry(fn, 3 attempts, exponential backoff)
```

---

# 8. 🛡️ ANTI-BOT STRATEGY

---

## MVP (FREE)

* Random user-agent
* Add delays (50–150ms)
* Avoid rapid repeated calls

---

## SCALE (FUTURE)

* Proxy rotation
* Residential IPs
* Header randomization

---

# 9. 📍 LOCATION HANDLING

---

## Input

```json
{
  "pincode": "560067"
}
```

---

## Convert to:

```plaintext
lat: 12.97
lng: 77.75
```

---

## Pass to ALL connectors

---

# 10. 📦 OUTPUT FORMAT (STRICT)

```json
{
  "name": "Amul Milk",
  "normalized_name": "milk",
  "price": 52,
  "currency": "INR",
  "quantity": "500ml",
  "platform": "blinkit",
  "eta_minutes": 10,
  "in_stock": true
}
```

---

# 11. ⚠️ FAILURE SCENARIOS

---

## Case 1: Platform API changed

→ Connector fails
→ Aggregator ignores

---

## Case 2: Platform blocked

→ Retry → fallback

---

## Case 3: No results

→ Return empty array

---

# 12. 🔄 CIRCUIT BREAKER

---

If connector fails repeatedly:

```ts
if (failure_rate > 50%) disable connector for 1 min
```

---

# 13. 🧠 DATA NORMALIZATION

---

Convert:

```plaintext
"Amul Taaza Milk 500ml" → "milk"
```

---

# 14. 💸 COST OPTIMIZATION

---

* Avoid Playwright unless necessary
* Cache aggressively
* Batch queries

---

# 15. 🚀 SCALING PATH

---

## MVP

* Direct API calls

---

## Growth

* Cached product catalog

---

## Scale

* Partner APIs

---

# 🏁 FINAL RULE

> Connector failures must NEVER affect user experience.
> Partial data > no data.

---
