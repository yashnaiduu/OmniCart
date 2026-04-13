# 🧠 09_AI_ENGINE_SPEC.md (PRODUCTION / YC-LEVEL / COST-FREE MVP)

---

# 1. 🎯 PURPOSE

Defines the **AI intelligence layer** of OmniCart responsible for:

* Natural language understanding
* Grocery list expansion
* Real-time suggestions
* Product normalization
* Personalization

---

# 2. 🧠 DESIGN PRINCIPLES

---

## Core Rules

* Deterministic logic FIRST
* AI only as fallback
* Latency must be minimal
* Must work fully offline (MVP baseline)

---

## Priority Order

```plaintext
Rules → Graph → Heuristics → LLM (last)
```

---

# 3. 🧩 SYSTEM COMPONENTS

---

## 3.1 Input Parsing Engine

---

### Goal

Convert raw user input into structured data.

---

### Input

```plaintext
"need groceries for pasta dinner"
```

---

### Output

```json
[
  { "item": "pasta", "quantity": "500g" },
  { "item": "tomato sauce", "quantity": "1 jar" },
  { "item": "cheese", "quantity": "200g" }
]
```

---

### Implementation

```ts
function parseInput(text: string): ParsedItem[] {
  // simple keyword + rule mapping
}
```

---

---

## 3.2 Real-Time Suggestion Engine

---

### Goal

Suggest missing items **while user types**

---

### Example

```plaintext
User types: "bread"
```

Suggestions:

```plaintext
butter, jam, eggs
```

---

### Implementation (Rule-Based)

```ts
const suggestionMap = {
  bread: ["butter", "jam", "eggs"],
  pasta: ["sauce", "cheese", "garlic"]
};
```

---

---

## 3.3 Co-Purchase Graph Engine

---

### Purpose

Suggest items based on **historical relationships**

---

### Data Model

```plaintext
milk → bread, eggs
rice → dal, oil
```

---

### Storage (MVP)

```sql
CREATE TABLE co_purchase (
  item TEXT,
  related_item TEXT,
  weight INT
);
```

---

### Query

```ts
SELECT related_item FROM co_purchase
WHERE item = 'milk'
ORDER BY weight DESC;
```

---

---

## 3.4 Product Normalization Engine

---

### Goal

Convert messy product names into clean identifiers

---

### Example

```plaintext
"Amul Taaza Milk 500ml" → "milk"
```

---

### Implementation

```ts
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/amul|taaza|500ml/g, "")
    .trim();
}
```

---

---

## 3.5 Quantity Inference Engine

---

### Goal

Infer quantities based on context

---

### Examples

```plaintext
"family of 4" → increase quantities
"party" → bulk mode
```

---

### Rules

```ts
if (context === "family") multiplyQuantity(2);
if (context === "party") multiplyQuantity(3);
```

---

---

## 3.6 Personalization Engine

---

### Inputs

* user purchase history
* brand preference
* frequency

---

### Example

```plaintext
User buys Amul →
Suggest Amul again
```

---

### Logic

```ts
if (user.prefers_brand) boost_score += 20;
```

---

---

## 3.7 LLM Fallback (LIMITED USE)

---

### When to use:

* Complex input
* Unknown queries

---

### Example

```plaintext
"plan a birthday party"
```

---

### Prompt

```plaintext
Expand this grocery request into a list of required items:
"birthday party for 5 people"
```

---

### Output

```json
["cake", "candles", "chips", "drinks"]
```

---

### Rules

* Use only when rule system fails
* Cache results
* Limit usage (<10%)

---

---

# 4. ⚡ REAL-TIME FLOW

---

```plaintext
User Input →
Parser →
Suggestion Engine →
Graph →
(Optional LLM) →
Final List
```

---

# 5. ⚡ PERFORMANCE REQUIREMENTS

---

| Component    | Max Latency |
| ------------ | ----------- |
| Parser       | <10ms       |
| Suggestions  | <20ms       |
| Graph lookup | <20ms       |
| LLM fallback | <300ms      |

---

# 6. 💸 COST-FREE STRATEGY

---

## MVP Stack

* Rule-based logic
* PostgreSQL graph
* No external AI API required

---

## LLM Usage

* Optional
* Cached
* Minimal

---

# 7. ⚠️ EDGE CASES

---

## Case 1: Unknown input

→ fallback to LLM

---

## Case 2: Ambiguous item

```plaintext
"rice"
```

→ Ask:

* basmati?
* brown?

---

## Case 3: Empty input

→ return []

---

---

# 8. 🔁 FEEDBACK LOOP

---

```plaintext
User accepts suggestion →
increase weight

User ignores →
decrease weight
```

---

---

# 9. 🧪 FAILURE SCENARIOS

---

## AI engine fails

→ return raw input

---

## LLM timeout

→ skip expansion

---

## Graph missing

→ fallback to rules

---

---

# 10. 🚀 SCALING PATH

---

## MVP

* Rules + basic graph

---

## Growth

* Embeddings (vector DB)

---

## Scale

* ML models
* Real-time learning

---

---

# 🏁 FINAL RULE

> AI must enhance experience, NOT block it.
> Deterministic logic is always priority.

---
