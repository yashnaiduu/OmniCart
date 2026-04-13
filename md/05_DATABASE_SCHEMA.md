# 🧠 05_DATABASE_SCHEMA.md (PRODUCTION + COST-FREE MVP)

---

# 1. 🎯 PURPOSE

Defines:

* Data storage strategy
* Schema design
* Indexing
* Caching
* Performance optimization

---

# 2. ⚙️ DATABASE STRATEGY

---

## 2.1 Dual Layer Design

| Layer          | Tech                 | Purpose         |
| -------------- | -------------------- | --------------- |
| Primary DB     | PostgreSQL           | persistent data |
| Cache          | Redis                | fast access     |
| Search         | PostgreSQL FTS (MVP) | search          |
| Graph (future) | Neo4j                | recommendations |

---

## 2.2 MVP COST-FREE SETUP

Use:

* Supabase (PostgreSQL free tier)
* Upstash Redis (free tier)

---

# 3. 🧱 CORE TABLES

---

## 3.1 USERS

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Indexing

```sql
CREATE INDEX idx_users_email ON users(email);
```

---

## 3.2 PREFERENCES

```sql
CREATE TABLE preferences (
  user_id UUID PRIMARY KEY,
  brand_preferences JSONB,
  budget_limit INT,
  updated_at TIMESTAMP
);
```

---

## 3.3 COLLECTIONS

```sql
CREATE TABLE collections (
  collection_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  name TEXT NOT NULL,
  type TEXT,
  frequency TEXT,
  created_at TIMESTAMP
);
```

---

### Indexes

```sql
CREATE INDEX idx_collections_user ON collections(user_id);
```

---

## 3.4 COLLECTION ITEMS

```sql
CREATE TABLE collection_items (
  item_id UUID PRIMARY KEY,
  collection_id UUID REFERENCES collections(collection_id),
  name TEXT,
  quantity TEXT,
  normalized_name TEXT,
  category TEXT
);
```

---

### Indexing

```sql
CREATE INDEX idx_items_collection ON collection_items(collection_id);
CREATE INDEX idx_items_name ON collection_items(normalized_name);
```

---

## 3.5 ORDERS

```sql
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  user_id UUID,
  total_cost INT,
  platform_split JSONB,
  created_at TIMESTAMP
);
```

---

# 4. 🔍 SEARCH DESIGN (COST-FREE)

---

## PostgreSQL Full Text Search

```sql
ALTER TABLE collection_items ADD COLUMN tsv tsvector;

UPDATE collection_items SET tsv = to_tsvector(name);

CREATE INDEX idx_search ON collection_items USING GIN(tsv);
```

---

## Query Example

```sql
SELECT * FROM collection_items
WHERE tsv @@ plainto_tsquery('milk');
```

---

# 5. ⚡ REDIS CACHE DESIGN

---

## 5.1 Key Structure

```plaintext
search:{query}:{pincode}
user:{user_id}:prefs
collection:{collection_id}
event:{event_id}
```

---

## 5.2 TTL Strategy

| Data           | TTL     |
| -------------- | ------- |
| Search results | 300 sec |
| Feed           | 60 sec  |
| Deals          | 120 sec |
| Preferences    | 600 sec |

---

## 5.3 Memory Strategy

* Max memory: 512MB (free tier safe)
* Eviction policy: `allkeys-lru`

---

## 5.4 Cache Write Pattern

```ts
if (cache exists) return
else fetch → store → return
```

---

# 6. ⚠️ CACHE STAMPEDE HANDLING

---

## Problem:

Multiple requests hit DB simultaneously

---

## Solution:

```ts
if (lock exists) wait
else acquire lock → fetch → release
```

---

# 7. 📊 QUERY OPTIMIZATION

---

## Rules:

* Always use indexes
* Avoid full table scans
* Use LIMIT for large queries

---

## Example Optimized Query

```sql
SELECT * FROM collections
WHERE user_id = $1
LIMIT 50;
```

---

# 8. 🧠 DATA NORMALIZATION

---

## Normalize Products

```plaintext
"Amul Milk 500ml" → "milk"
```

---

## Store both:

* raw name
* normalized name

---

# 9. 🔄 SCALING STRATEGY

---

## Step 1 (MVP)

* Single DB instance
* Redis cache

---

## Step 2 (Growth)

* Read replicas
* Partition tables

---

## Step 3 (Scale)

* Sharding
* Separate DB per service

---

# 10. 🛡️ DATA CONSISTENCY

---

## Rule:

* Use DB for truth
* Cache is secondary

---

## Write Flow:

```plaintext
DB → Cache update
```

---

# 11. ⚠️ FAILURE SCENARIOS

---

## Case 1: Redis down

→ fallback to DB

---

## Case 2: DB slow

→ return cached data

---

## Case 3: DB failure

→ return empty + error flag

---

# 12. 📦 STORAGE OPTIMIZATION

---

## JSONB usage

Use JSONB only for:

* flexible structures
* platform splits

---

Avoid:

* large blobs
* unnecessary nesting

---

# 13. 💸 COST OPTIMIZATION

---

* Use free tiers
* Limit heavy queries
* Cache aggressively

---

# 🏁 FINAL RULE

> Database must never be a bottleneck.
> Always prefer cache → DB → fail-safe.

---
