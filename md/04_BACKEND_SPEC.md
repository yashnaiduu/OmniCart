# ⚙️ 04_BACKEND_SPEC.md (PRODUCTION / YC-LEVEL)

---

# 1. 🎯 PURPOSE

Defines the **complete backend system design, service boundaries, execution flows, and guarantees**.

This document is the **single source of truth for backend implementation**.

---

# 2. 🧱 ARCHITECTURE PRINCIPLES

## 2.1 Mandatory Principles

* Stateless services only
* Horizontal scalability
* Strict service isolation
* Event-driven where applicable
* Cache-first design

---

## 2.2 Service Communication

| Type  | Usage                |
| ----- | -------------------- |
| REST  | synchronous requests |
| Kafka | async events         |

---

## 2.3 Latency Budget

| Component    | Max Time |
| ------------ | -------- |
| API Gateway  | 10ms     |
| Aggregation  | 120ms    |
| Matching     | 30ms     |
| Optimization | 20ms     |
| Total        | <200ms   |

---

# 3. 🧩 SERVICE DEFINITIONS

---

## 3.1 API Gateway

### Responsibilities:

* Authentication validation
* Rate limiting
* Request routing
* Logging

---

### Middleware Stack:

```ts
requestIdMiddleware()
authMiddleware()
rateLimiter()
loggingMiddleware()
```

---

## 3.2 Aggregation Service (CRITICAL CORE)

### Responsibilities:

* Accept search request
* Call connectors in parallel
* Handle failures
* Return normalized data

---

### FULL FLOW

```ts
async function aggregate(query, location) {
  const requestId = generateUUID();

  const cacheKey = `search:${query}:${location}`;
  const cached = await redis.get(cacheKey);

  if (cached) return cached;

  const results = await Promise.allSettled([
    blinkit.search(query, location),
    instamart.search(query, location),
    zepto.search(query, location)
  ]);

  const validResults = results
    .filter(r => r.status === "fulfilled")
    .map(r => r.value);

  const merged = mergeResults(validResults);

  await redis.set(cacheKey, merged, { ttl: 300 });

  return merged;
}
```

---

### FAILURE HANDLING

| Scenario            | Behavior                  |
| ------------------- | ------------------------- |
| One connector fails | Ignore, continue          |
| All connectors fail | Return empty + error flag |
| Timeout             | Return partial            |

---

### TIMEOUT WRAPPER

```ts
function withTimeout(promise, ms = 300) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject("timeout"), ms)
    )
  ]);
}
```

---

## 3.3 Connector Services

### Rules:

* Each platform = independent service
* No shared logic

---

### Function Contract

```ts
interface Connector {
  search(query: string, lat: number, lng: number): Promise<Product[]>;
}
```

---

### Retry Logic

```ts
async function retry(fn, retries = 3) {
  try {
    return await fn();
  } catch (e) {
    if (retries === 0) throw e;
    await delay(100 * (4 - retries));
    return retry(fn, retries - 1);
  }
}
```

---

## 3.4 Matching Service

### Responsibilities:

* Normalize product names
* Match similar products

---

### Algorithm

```ts
normalize("Amul Milk 500ml") → "milk"

score = fuzzyMatch(a, b)

if score > 80 → match
```

---

### Edge Cases:

* Different units (500ml vs 1L)
* Brand noise

---

## 3.5 Optimization Service

### Scoring Formula

```ts
score = (price_weight * price_score) + (eta_weight * eta_score)
```

---

### Modes:

| Mode     | price_weight | eta_weight |
| -------- | ------------ | ---------- |
| Cheapest | 1            | 0          |
| Fastest  | 0            | 1          |
| Balanced | 0.5          | 0.5        |

---

## 3.6 Input + Suggestion Service

### Flow:

```ts
"make pasta"
→ ["pasta", "sauce", "cheese"]
```

---

### Priority:

1. Rule-based
2. Graph-based
3. LLM fallback

---

# 4. 🧠 CACHING STRATEGY

---

## Redis Config

* Max memory: 2GB
* Eviction: allkeys-lru

---

## Key Design

```plaintext
search:{query}:{pincode}
```

---

## Cache Stampede Protection

```ts
if (lock exists) wait
else fetch + set lock
```

---

# 5. 🛡️ RESILIENCE DESIGN

---

## Circuit Breaker

Library: opossum

```ts
if (failure_rate > 50%) open circuit
```

---

## Retry Strategy

* Max 3 retries
* Exponential backoff

---

## Graceful Degradation

* Return partial data
* Never crash system

---

# 6. 🔐 SECURITY

---

## Mandatory

* JWT auth
* Input validation
* Rate limiting

---

## Request Validation Example

```ts
@IsString()
@Length(1, 100)
query: string;
```

---

# 7. 📊 LOGGING

---

## Format

```json
{
  "timestamp": "...",
  "service": "aggregation",
  "level": "info",
  "request_id": "uuid",
  "message": "success"
}
```

---

# 8. ⚠️ FAILURE SIMULATIONS

---

## Case 1: All connectors fail

→ Return:

```json
{
  "items": [],
  "error": "no_data"
}
```

---

## Case 2: Redis down

→ Skip cache → continue

---

## Case 3: Kafka down

→ Skip event → continue

---

# 9. 🚀 PERFORMANCE GUARANTEES

* P95 latency < 200ms
* Cache hit ratio > 70%
* Error rate < 1%

---

# 🧠 FINAL RULE

> Backend must NEVER block user flow.
> Partial data is always better than failure.

---
