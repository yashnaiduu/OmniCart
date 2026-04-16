# OmniCart — Production Scraping System

## 1. Objective

Build a real-time, location-aware grocery data aggregation system that collects and normalizes product data from:

- Swiggy Instamart
- Blinkit
- Zepto
- BigBasket

The system should support:
- Price comparison
- Availability tracking
- Unified search
- Analytics (pricing trends, ads, inventory)

---

## 2. Core Design Principles

- Prefer API interception over DOM scraping
- Always include geo-location (lat, long, city)
- Simulate real user sessions (cookies, headers)
- Store both raw and normalized data
- Keep platform-specific logic isolated

---

## 3. Architecture
User Query (search/category/location)
↓
Query Orchestrator
↓
Platform Adapters
├── Instamart Adapter
├── Blinkit Adapter
├── Zepto Adapter
└── BigBasket Adapter
↓
Raw Data Store
↓
Normalization Layer
↓
Unified Database (MongoDB)
↓
OmniCart API Layer


---

## 4. Core Components

### 4.1 Query Orchestrator

Handles:
- Search queries (e.g., milk, rice)
- Categories
- User location (lat, long, city)

Responsibilities:
- Fan-out requests to all platforms
- Manage timeouts per platform
- Aggregate and deduplicate results

---

### 4.2 Platform Adapters

Each platform must have its own independent adapter.

---

## 5. Platform Strategies

### 5.1 Instamart Adapter

Approach:
- Apify Actor `smacient/swiggy-instamart-data-extractor` via Apify API

Flow:
1. Initialize Apify client
2. Trigger the Actor run synchronously taking query & location
3. Parse structured JSON from the cloud dataset

Extract:
- price, mrp, discount
- ratings
- stock status
- isAd (sponsored products)

---

### 5.2 Blinkit Adapter

Approach:
- Apify Actor `zangscraper/blinkit-zepto-apify-actor`

Steps:
1. Pass search keyword and delivery location to Actor
2. Trigger synchronous run with `maxItems` defined
3. Parse Blinkit results from the returned dataset array

Notes:
- Offloads session dependency to Apify cloud
- Provides location-aware prices

---

### 5.3 Zepto Adapter

Approach:
- Apify Actor `zangscraper/blinkit-zepto-apify-actor` (Primary)
- Fallback: `shahidirfan/zepto-product-scraper`

Flow:
1. Leverage the combined Blinkit/Zepto actor or standalone Zepto actor
2. Pass search query (default Mumbai or specified location)
3. Extract product data

Extract:
- price
- availability
- delivery ETA

---

### 5.4 BigBasket Adapter

Approach:
- Primary: `fooddatascrape.com` Commercial API
- Fallback: Porting Python logic from `Gaurang105/BigBasket_Scraper` to Node.js/Playwright

Notes:
- Prefer commercial API for stable real-time data
- Avoid building from scratch to bypass robust anti-bot measures

---

## 6. Unified Data Schema

```json
{
  "platform": "instamart | blinkit | zepto | bigbasket",
  "location": {
    "city": "string",
    "lat": "number",
    "lng": "number"
  },

  "search_query": "string",
  "category": "string",

  "product_id": "string",
  "name": "string",
  "brand": "string",
  "variant": "string",

  "price": "number",
  "mrp": "number",
  "discount_percent": "number",
  "savings": "number",

  "unit": "string",
  "price_per_unit": "string",

  "rating": "number",
  "rating_count": "number",

  "in_stock": "boolean",
  "delivery_eta": "string",

  "is_ad": "boolean",

  "image_url": "string",
  "product_url": "string",

  "platform_metadata": {},
  "scraped_at": "timestamp"
}

7. Data Pipeline
7.1 Raw Data Storage

Store original responses:
{
  "platform": "string",
  "raw_response": {},
  "timestamp": "ISO_DATE"
}

Purpose:

Debugging
Reprocessing
Schema updates
7.2 Normalization Layer

Responsibilities:

Map platform-specific fields → unified schema
Handle missing fields
Normalize units and pricing formats
8. Anti-Bot Strategy
Required:

Proxy rotation
User-agent rotation
Request throttling
Session reuse

Optional:

CAPTCHA handling
Headless browser stealth mode

9. Scheduling Strategy
Task	Frequency
Price updates	15 minutes
Stock updates	10 minutes
Full catalog	Daily

10. Scaling Strategy
Use queue system (Redis / Kafka)
Run distributed workers
Each worker handles:
One platform OR
One location batch

Caching:

Cache repeated queries (TTL: 5–10 mins)
11. Failure Handling
Timeout per platform (2–5 seconds)
Retry with exponential backoff
Fallback hierarchy:
API → headless scraping → skip

12. Tech Stack
Scraping: Playwright + Axios
Backend: Node.js
Database: MongoDB
Queue: Redis
Proxy: BrightData / SmartProxy
13. Key Requirements
Every request must include location
Always store raw + processed data
Keep adapters modular and isolated
Prefer API over DOM scraping


