<div align="center">
  <img src="./frontend/public/favicon.ico" width="80" alt="OmniCart Logo" />
  <h1>OmniCart</h1>
  <p><strong>The "Bloomberg Terminal" of Quick Commerce</strong></p>
  <p>
    An intelligent, ultra-fast aggregation engine that scrapes, standardizes, and compares grocery prices across multiple delivery platforms (Blinkit, Swiggy Instamart, Zepto, JioMart) in real-time.
  </p>
</div>

---

## ⚡ Features

* **Real-time Price Aggregation:** Scrapes live data from top Q-commerce platforms simultaneously using a managed headless browser pool.
* **Unified Cart System:** Add items from different platforms into a single, cohesive cart. Optimize for the lowest total price or fastest overall delivery.
* **AI-Powered Standardization:** Integrates with Gemini AI to normalize vastly different product titles, weights, and categories into a clean, standardized taxonomy.
* **Resilient Infrastructure:** Employs Opossum circuit breakers to prevent failing connectors from bringing down the search pipeline.
* **Premium "Obsidian" UI:** A sleek, dark-mode-first interface heavily inspired by Bloomberg Terminals, featuring 60fps hardware-accelerated shimmer states, asymmetrical glassmorphism, and a minimalist design.

## 🏗 Architecture

OmniCart is a monorepo consisting of a robust NestJS backend and a highly responsive Next.js frontend.

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS v4, Framer Motion, Zustand (State Management).
* **Backend:** NestJS, TypeScript, Prisma (ORM).
* **Scraping Engine:** Playwright with `puppeteer-extra-plugin-stealth` to bypass bot mitigation.
* **Caching & Queues:** Redis (for blistering fast `< 10ms` repeated searches).
* **Database:** PostgreSQL.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18+)
- PostgreSQL
- Redis
- Playwright Chromium Binaries (`npx playwright install chromium`)

### 1. Clone the repository

```bash
git clone https://github.com/yashnaiduu/OmniCart.git
cd OmniCart
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/omnicart"
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY="your_api_key_here"
```

Initialize the database and start the server:
```bash
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Start the frontend development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to access the OmniCart interface.

## 🧠 How the Aggregation Engine Works

1. **User Query:** The user searches for "Milk".
2. **AI Parsing:** Gemini interprets the query to understand intent, category, and brand.
3. **Parallel Scraping:** The `AggregationService` launches stealth Playwright instances to search Blinkit, Zepto, and Instamart simultaneously. Images, fonts, and stylesheets are blocked at the network level to reduce bandwidth by 90%.
4. **Resiliency:** If Zepto takes longer than 12 seconds to respond, the circuit breaker trips and returns the results from Blinkit and Instamart so the user isn't kept waiting.
5. **Normalization:** Results are normalized, sorted by price/ETA, and sent back to the frontend.
6. **Caching:** The exact query and pincode pair is cached in Redis for 5 minutes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/yashnaiduu/OmniCart/issues).

## 📄 License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
