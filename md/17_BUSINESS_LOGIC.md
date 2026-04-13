# 💼 17_BUSINESS_LOGIC.md (PRODUCTION / DECISION ENGINE)

---

# 1. 🎯 PURPOSE

Defines all **core decision-making logic** for:

* Product selection
* Platform optimization
* Recommendations
* Budget enforcement
* Revenue hooks

---

# 2. 🧠 CORE PRINCIPLE

> Always maximize **user value first**, then optimize for business.

---

# 3. ⚙️ PRODUCT MATCHING LOGIC

---

## Input

```plaintext
milk
```

---

## Output Candidates

```plaintext
Amul Milk 500ml
Nandini Milk 500ml
```

---

## Matching Score

```ts
score = fuzzy_match + brand_match + quantity_match
```

---

## Rules

* Score > 80 → valid match
* Prefer exact quantity
* Prefer known brands

---

# 4. 💰 PRICE OPTIMIZATION ENGINE

---

## Goal

Find best cart combination across platforms

---

## Scoring Formula

```ts
score = (price_weight * price_score) + (eta_weight * eta_score)
```

---

## Modes

| Mode     | Description       |
| -------- | ----------------- |
| cheapest | minimize price    |
| fastest  | minimize delivery |
| balanced | mix both          |

---

## Example

```plaintext
Blinkit → ₹500 (10 min)
Instamart → ₹480 (15 min)

Balanced → Instamart
```

---

# 5. 🧩 CART SPLITTING LOGIC

---

## Goal

Split order across platforms to reduce cost

---

## Example

```plaintext
Milk → Instamart
Snacks → Blinkit
Total cheaper than single platform
```

---

## Constraint

* Do not exceed 2 platforms (UX simplicity)

---

# 6. 🧠 RECOMMENDATION ENGINE

---

## Priority Order

1. User history
2. Popular items
3. Co-purchase graph
4. Cheapest option

---

## Example

```plaintext
User buys Amul →
Recommend Amul again
```

---

# 7. 🏷️ BRAND PREFERENCE ENGINE

---

## Logic

```ts
if (user_prefers_brand) boost_score += 20
```

---

---

# 8. 💸 BUDGET GUARDIAN

---

## Logic

```ts
if (cart_total > budget):
  suggest cheaper alternatives
```

---

## Example

```plaintext
Rice ₹500 →
Suggest ₹400 alternative
```

---

# 9. 🔔 PRICE DROP ALERT LOGIC

---

## Trigger

```ts
if (new_price < old_price):
  send alert
```

---

## Threshold

* Minimum drop: 5%

---

# 10. 🔄 REFILL LOGIC

---

## Logic

```ts
if (last_order_exists):
  suggest refill
```

---

## Enhancement

* Adjust quantity based on usage

---

# 11. 📊 SAVINGS CALCULATION

---

## Formula

```ts
savings = max_price - chosen_price
```

---

## Display

* Per item
* Total savings

---

# 12. 🧠 PERSONALIZATION LOOP

---

```plaintext
User actions →
update preferences →
improve recommendations
```

---

# 13. ⚠️ EDGE CASES

---

## Case 1: No matching products

→ return raw query

---

## Case 2: Same price everywhere

→ choose fastest

---

## Case 3: Missing ETA

→ fallback to price

---

# 14. 💰 REVENUE HOOKS (FUTURE)

---

## Options

* Affiliate links
* Sponsored products
* Subscription plans

---

## Rule

* Never degrade user trust

---

# 15. ⚡ PERFORMANCE RULES

---

* Decision logic < 50ms
* No blocking calls

---

# 16. 🧪 FAILURE SCENARIOS

---

## Case: Optimization fails

→ fallback to cheapest

---

## Case: Missing data

→ partial decision

---

# 🏁 FINAL RULE

> Always give the user a decision — never return nothing.
> Even a suboptimal result is better than no result.

---
