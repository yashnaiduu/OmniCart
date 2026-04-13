# 🔌 06_API_CONTRACTS.md (PRODUCTION / YC-LEVEL)

---

# 1. 🎯 PURPOSE

Defines **ALL API interfaces** used across the system.

This document ensures:

* No ambiguity between services
* Strict request/response formats
* Backward compatibility
* Frontend/backend alignment

---

# 2. 🌐 GLOBAL API RULES

---

## 2.1 Base URL

```plaintext
/api/v1
```

---

## 2.2 Headers (MANDATORY)

```http
Authorization: Bearer <JWT>
Content-Type: application/json
X-Request-ID: <uuid>
X-Client-Version: <version>
```

---

## 2.3 Standard Response Format

ALL APIs MUST return:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "uuid",
    "latency_ms": 120
  }
}
```

---

## 2.4 Error Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Query cannot be empty"
  },
  "meta": {
    "request_id": "uuid"
  }
}
```

---

# 3. 🔐 AUTH APIs

---

## POST /auth/login

### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

---

### Response

```json
{
  "success": true,
  "data": {
    "access_token": "jwt",
    "refresh_token": "jwt",
    "expires_in": 900
  }
}
```

---

### Errors

| Code                | Meaning      |
| ------------------- | ------------ |
| INVALID_CREDENTIALS | wrong login  |
| USER_NOT_FOUND      | user missing |

---

## POST /auth/refresh

---

# 4. 🔍 SEARCH API (CORE)

---

## POST /search

### Request

```json
{
  "query": "milk and bread",
  "pincode": "560067",
  "mode": "balanced"
}
```

---

### Validation Rules

* query: required, 1–200 chars
* pincode: 6 digits
* mode: enum [cheapest, fastest, balanced]

---

### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "milk",
        "normalized_name": "milk",
        "options": [
          {
            "platform": "blinkit",
            "price": 52,
            "currency": "INR",
            "eta_minutes": 10,
            "product_url": "https://...",
            "in_stock": true
          },
          {
            "platform": "instamart",
            "price": 50,
            "eta_minutes": 12
          }
        ],
        "recommended": {
          "platform": "instamart",
          "reason": "lowest_price"
        }
      }
    ]
  }
}
```

---

### Edge Cases

| Scenario        | Behavior                   |
| --------------- | -------------------------- |
| Empty query     | return empty list          |
| No results      | return items: []           |
| Partial failure | return available platforms |
| Invalid pincode | error                      |

---

# 5. 📁 COLLECTION APIs

---

## POST /collections

### Request

```json
{
  "name": "Monthly Groceries",
  "type": "recurring",
  "frequency": "monthly"
}
```

---

## GET /collections

---

## POST /collections/{id}/items

```json
{
  "name": "rice",
  "quantity": "5kg"
}
```

---

# 6. 🔁 REFILL API

---

## POST /refill

### Request

```json
{
  "collection_id": "uuid"
}
```

---

### Response

Same format as `/search`

---

# 7. 🏠 FEED API

---

## GET /feed

### Response

```json
{
  "data": {
    "refill_suggestions": [],
    "deals": [],
    "price_drops": [],
    "recommendations": []
  }
}
```

---

# 8. 💰 BUDGET API

---

## POST /budget

```json
{
  "monthly_limit": 5000
}
```

---

# 9. 🔔 PRICE ALERT API

---

## GET /alerts

Returns price drop alerts

---

# 10. 📦 SUBSCRIPTION API

---

## POST /subscriptions

```json
{
  "collection_id": "uuid",
  "frequency": "monthly"
}
```

---

# 11. 📊 PAGINATION RULES

---

## Format

```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 100
}
```

---

# 12. ⚡ RATE LIMITING

| Endpoint | Limit   |
| -------- | ------- |
| /search  | 60/min  |
| /auth    | 10/min  |
| others   | 100/min |

---

# 13. 🔄 VERSIONING

* Version in URL: `/v1`
* Future: `/v2`

---

# 14. 🛡️ SECURITY RULES

* Reject unknown fields
* Strict validation
* Sanitize inputs

---

# 15. ⚠️ FAILURE SCENARIOS

---

## Case: Aggregation timeout

→ Return partial results + warning flag

---

## Case: Auth expired

→ Return 401 + refresh hint

---

# 🧠 FINAL RULE

> API contracts must NEVER change without version bump.

---
