# 🚀 10_GROWTH_LAYER_SPEC.md (PRODUCTION + COST-FREE MVP)

---

# 1. 🎯 PURPOSE

Defines all systems responsible for:

* Retention
* Engagement
* Revenue
* Habit formation

---

# 2. 🧩 CORE SERVICES

---

## 2.1 One-Tap Refill Service

---

### Purpose:

Reorder previous groceries instantly

---

### Flow:

```plaintext id="3f13nv"
User clicks "Refill" →
Fetch last order →
Re-run aggregation →
Show optimized cart
```

---

### API

```http id="38vh4y"
POST /refill
```

---

### Logic

```ts id="tdz7cw"
const lastOrder = getLastOrder(user_id);
return aggregate(lastOrder.items);
```

---

## 2.2 Smart Collections (Folders)

---

### Types:

* Monthly groceries
* Party
* Custom

---

### Features:

* Bulk add
* Edit items
* Reuse anytime

---

---

## 2.3 Subscription Engine

---

### Purpose:

Automate recurring orders

---

### Example:

```plaintext id="0pmdfs"
Milk → every 2 days  
Groceries → monthly
```

---

### Scheduler (FREE)

Use:

* Node cron jobs

---

```ts id="2d1i9i"
cron.schedule("0 9 * * 1", () => runSubscription());
```

---

---

## 2.4 Price Drop Alerts

---

### Purpose:

Notify when price decreases

---

### Flow:

```plaintext id="wlsn2o"
Background job →
Check cached prices →
Compare →
Trigger event
```

---

---

## 2.5 Dynamic Deal Engine

---

### Purpose:

Find best combos across platforms

---

### Logic:

```plaintext id="pvg80u"
Split cart across platforms →
Minimize total cost
```

---

---

## 2.6 Budget Guardian

---

### Purpose:

Prevent overspending

---

### Logic:

```plaintext id="qlfa2r"
if total > budget:
  suggest cheaper alternatives
```

---

---

## 2.7 Hyper-Personalized Feed

---

### Components:

* refill suggestions
* deals
* price drops
* recommendations

---

### API

```http id="v9k1q2"
GET /feed
```

---

---

## 2.8 Delivery Time Optimizer

---

### Purpose:

Choose fastest delivery

---

### Logic:

```plaintext id="ivlf6j"
minimize ETA across platforms
```

---

---

## 2.9 Brand Preference Engine

---

### Purpose:

Respect user preferences

---

### Example:

```plaintext id="8o9bdf"
User prefers Amul →
rank higher
```

---

---

## 2.10 Savings Dashboard

---

### Purpose:

Show value to user

---

### Metrics:

* money saved
* best deal used
* monthly savings

---

---

## 2.11 Offline Mode + Sync

---

### Purpose:

Allow usage without internet

---

### Implementation:

* Store collections locally
* Sync when online

---

---

# 3. ⚡ PERFORMANCE RULES

---

* Feed load < 150ms
* Refill < 200ms
* Alerts async

---

# 4. 💸 COST-FREE IMPLEMENTATION

---

## Tools:

* Redis → caching
* Cron → scheduling
* PostgreSQL → storage

---

## Avoid:

* expensive ML infra
* paid schedulers

---

# 5. ⚠️ EDGE CASES

---

## Case 1: No past data

→ show default suggestions

---

## Case 2: Budget not set

→ skip budget logic

---

## Case 3: No deals found

→ fallback to cheapest

---

---

# 6. 🔁 EVENT INTEGRATION

---

Uses events:

```plaintext id="m5m6vx"
order.completed → refill
price.updated → alerts
```

---

---

# 7. 🧠 PERSONALIZATION LOOP

---

```plaintext id="b5nq5w"
User behavior →
update preferences →
improve feed
```

---

---

# 8. 🚀 SCALING PATH

---

## MVP

* Basic rules

---

## Growth

* ML-based personalization

---

## Scale

* predictive ordering

---

# 🏁 FINAL RULE

> Growth layer must NEVER slow core experience.
> Everything runs async where possible.

---
