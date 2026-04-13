# 🔄 07_EVENT_SYSTEM.md (PRODUCTION + COST-FREE MVP)

---

# 1. 🎯 PURPOSE

Defines the **event-driven backbone** of OmniCart.

Goals:

* Decouple services
* Enable async processing
* Improve scalability
* Prevent blocking flows

---

# 2. ⚙️ DUAL-MODE DESIGN (IMPORTANT)

We support **2 modes**:

| Mode         | Usage                    |
| ------------ | ------------------------ |
| MVP (FREE)   | In-memory / Redis PubSub |
| Scale (Paid) | Kafka                    |

---

# 3. 🟢 MVP MODE (COST-FREE)

---

## Technology

* Redis Pub/Sub (Upstash free tier)
  OR
* Node.js EventEmitter (single instance)

---

## Event Bus Interface

```ts
interface EventBus {
  publish(event: Event): void;
  subscribe(eventType: string, handler: Function): void;
}
```

---

## Example Implementation (MVP)

```ts
import { EventEmitter } from "events";

const eventBus = new EventEmitter();

export function publish(event) {
  eventBus.emit(event.type, event);
}

export function subscribe(type, handler) {
  eventBus.on(type, handler);
}
```

---

# 4. 🔴 SCALE MODE (FUTURE - KAFKA)

---

## Technology

* Apache Kafka (Confluent)

---

## Topic Design

```plaintext
user.events
collection.events
order.events
price.events
```

---

## Partition Strategy

* Partition key = user_id
* Ensures ordering per user

---

# 5. 📦 EVENT FORMAT (STRICT)

```json
{
  "event_id": "uuid",
  "event_type": "order.completed",
  "timestamp": "2026-01-01T10:00:00Z",
  "source": "aggregation-service",
  "payload": {},
  "metadata": {
    "request_id": "uuid",
    "version": "v1"
  }
}
```

---

# 6. 📡 CORE EVENTS

---

## USER EVENTS

```plaintext
user.created
user.updated
```

---

## COLLECTION EVENTS

```plaintext
collection.created
collection.updated
item.added
item.removed
```

---

## ORDER EVENTS

```plaintext
order.requested
order.completed
```

---

## PRICE EVENTS

```plaintext
price.updated
deal.updated
```

---

# 7. 🔁 PRODUCER / CONSUMER MAP

---

## Producers

| Service             | Emits           |
| ------------------- | --------------- |
| user-service        | user.created    |
| collection-service  | item.added      |
| aggregation-service | order.requested |
| price-monitor       | price.updated   |

---

## Consumers

| Service        | Subscribes      |
| -------------- | --------------- |
| feed-service   | item.added      |
| budget-service | order.completed |
| deal-service   | price.updated   |

---

# 8. 🔐 IDEMPOTENCY (CRITICAL)

Every consumer MUST handle duplicate events.

---

## Strategy

```ts
if (event_id already processed) return;
```

Store processed IDs in Redis:

```plaintext
event:{event_id}
TTL: 24 hours
```

---

# 9. ⚠️ FAILURE HANDLING

---

## MVP Mode

* Event failure → log error
* Continue execution

---

## Kafka Mode

* Retry 3 times
* Dead Letter Queue (DLQ)

---

# 10. 🧪 FAILURE SCENARIOS

---

## Case 1: Event handler crash

→ Log error
→ Do not crash main service

---

## Case 2: Event bus down

→ Continue core flow
→ Skip async updates

---

## Case 3: Duplicate events

→ Ignore via idempotency

---

# 11. ⚡ PERFORMANCE RULES

* Event publish time < 5ms
* Handler must be async
* No blocking operations

---

# 12. 🧠 EVENT PRIORITY

---

| Type            | Priority |
| --------------- | -------- |
| order.completed | HIGH     |
| item.added      | MEDIUM   |
| price.updated   | LOW      |

---

# 13. 🔄 MIGRATION STRATEGY (MVP → SCALE)

---

## Step 1:

Use EventEmitter / Redis

---

## Step 2:

Replace with Kafka adapter

---

## Step 3:

No code change in services (adapter pattern)

---

# 14. 🧠 DESIGN PATTERN

Use Adapter:

```ts
class EventBusAdapter {
  publish(event) { ... }
}
```

---

# 🏁 FINAL RULE

> Event system MUST NEVER block user flow.
> If it fails, system must still function.

---
