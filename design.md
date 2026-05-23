# OmniCart Backend Perfection Audit & Integration Prompts
## Systematic Verification & Enhancement Checklist

---

# PROMPT 1: Complete API Endpoint Audit & Documentation

```
You are a senior backend architect reviewing the OmniCart NestJS backend. 

TASK: Perform a comprehensive audit of all API endpoints and generate:

1. API INVENTORY TABLE
Create a markdown table with:
- Endpoint path
- HTTP method
- Request payload schema
- Response schema
- Authentication required (Yes/No)
- Connected to frontend (Yes/No/Partial)
- Rate limit status
- Cache strategy

2. IDENTIFY GAPS
List any:
- Missing endpoints that frontend might need
- Endpoints that exist but aren't being called
- Inconsistent response formats
- Missing error handling
- Endpoints without proper validation

3. INTEGRATION MAPPING
For each frontend page/component, map:
- Which API endpoints it should call
- Current integration status
- Missing connections
- Potential race conditions

4. OPENAPI/SWAGGER SPEC
Generate complete Swagger/OpenAPI 3.0 documentation for all endpoints

5. POSTMAN COLLECTION
Create a complete Postman collection JSON for testing all endpoints

STRUCTURE YOUR RESPONSE AS:
├── API Inventory
├── Gap Analysis
├── Frontend-Backend Mapping
├── Swagger Specification
└── Testing Checklist

Focus on: Authentication flows, product search, price comparison, cart management, user preferences, and location services.
```

---

# PROMPT 2: Location Services Deep Dive

```
You are a geolocation specialist optimizing OmniCart's location detection system.

TASK: Audit and perfect the location handling pipeline:

1. FRONTEND LOCATION CAPTURE
Review and enhance:
- Browser Geolocation API implementation
- Permission request UX flow
- Fallback strategies (IP geolocation, manual entry)
- Location caching strategy (localStorage vs sessionStorage)
- Accuracy thresholds
- Error handling for all edge cases:
  * Permission denied
  * Timeout
  * Position unavailable
  * Low accuracy (<100m)
  * Location services disabled

2. BACKEND LOCATION VALIDATION
Check:
- Coordinate validation logic
- Service area boundary checking
- Distance calculations (Haversine formula accuracy)
- Database schema for storing user locations:
  ```sql
  user {
    id
    latitude DECIMAL(10, 8)
    longitude DECIMAL(11, 8)
    city VARCHAR
    accuracy FLOAT
    lastLocationUpdate TIMESTAMP
  }
  ```
- Index optimization for geospatial queries

3. LOCATION-AWARE SCRAPING
Ensure every scraping request includes:
- Latitude/longitude coordinates
- City name
- Platform-specific location formatting
- Fallback locations for testing

4. TESTING SCENARIOS
Create test cases for:
- Valid locations in service areas
- Locations outside service areas
- Edge of boundary locations
- Invalid coordinates
- Missing location data
- Multiple rapid location changes

5. DELIVERABLES
Provide:
- Enhanced location service code
- Database migration script
- Environment variables needed
- Testing script with mock coordinates
- Error message templates
- Location permission flow diagram

CRITICAL: Ensure location is captured BEFORE any product search and passed to ALL scraping requests.
```

---

# PROMPT 3: Scraping Pipeline Integrity Check

```
You are a web scraping architect ensuring OmniCart's real-time data pipeline is bulletproof.

TASK: Validate the complete scraping infrastructure:

1. ADAPTER AUDIT
For each platform (Swiggy, Blinkit, Zepto, BigBasket, Amazon Fresh):

Check existence of:
- [ ] Playwright/Axios adapter class
- [ ] Location parameter injection
- [ ] Search query normalization
- [ ] Response parsing logic
- [ ] Error handling (404, timeout, CAPTCHA, rate limit)
- [ ] Retry mechanism with exponential backoff
- [ ] Data normalization to unified schema

2. UNIFIED SCHEMA VALIDATION
Verify all adapters return consistent format:
```typescript
interface UnifiedProduct {
  platform: 'swiggy' | 'blinkit' | 'zepto' | 'bigbasket' | 'amazon'
  productId: string
  name: string
  brand?: string
  imageUrl: string
  price: {
    current: number
    original?: number
    discount?: number
    discountPercentage?: number
  }
  inventory: {
    inStock: boolean
    quantity?: number
  }
  delivery: {
    eta: number // minutes
    etaText: string
    fee?: number
    minOrder?: number
  }
  metadata: {
    rating?: number
    reviewCount?: number
    weight?: string
    unit?: string
  }
  scrapedAt: Date
}
```

3. REDIS INTEGRATION
Verify:
- Queue setup for scraping jobs
- Cache keys structure: `product:{query}:{lat}:{lon}:{platform}`
- TTL strategy (5-10 minutes recommended)
- Cache invalidation triggers
- Queue priority system (user searches > background refreshes)

4. PERFORMANCE OPTIMIZATION
Check:
- Parallel scraping (Promise.all for 5 platforms)
- Timeout limits (max 15 seconds per platform)
- Fallback to cached data on failure
- Partial results handling (some platforms fail, some succeed)

5. ERROR HANDLING MATRIX
Create comprehensive error handling:
- Platform unreachable → Return cached data + warning
- CAPTCHA triggered → Queue for manual review + fallback
- Rate limited → Exponential backoff + switch to backup proxy
- Invalid location → Return error immediately
- No results found → Return empty array, not error

6. TESTING SUITE
Provide:
- Mock API responses for each platform
- Integration test script
- Load testing scenarios (100 concurrent searches)
- Failure recovery tests

DELIVERABLE: Production-ready scraping module with 99% uptime guarantee.
```

---

# PROMPT 4: Database Schema & Prisma Optimization

```
You are a database architect optimizing OmniCart's PostgreSQL schema.

TASK: Review and perfect the Prisma schema and database structure:

1. SCHEMA AUDIT
Review current schema.prisma for:

Users table:
- [ ] All necessary fields (id, email, password, location fields)
- [ ] Proper indexes on frequently queried fields
- [ ] Cascade delete rules
- [ ] Timestamps (createdAt, updatedAt)

Preferences table:
- [ ] User relationship (1:1)
- [ ] Budget limits
- [ ] Preferred platforms
- [ ] Notification settings

Collections table (Shopping Lists):
- [ ] User relationship (1:many)
- [ ] Name, description
- [ ] Sharing capabilities
- [ ] Soft delete support

CollectionItems table:
- [ ] Collection relationship
- [ ] Product reference (name, not ID - products change)
- [ ] Quantity
- [ ] Priority/order

Orders table:
- [ ] User relationship
- [ ] Platform
- [ ] Items (JSON or separate table?)
- [ ] Total amount
- [ ] Status tracking
- [ ] Timestamps

2. MISSING TABLES
Identify if you need:
- SearchHistory (for autocomplete)
- PriceAlerts (notify when price drops)
- ProductCache (store scraped products temporarily)
- UserSessions (for auth token management)

3. INDEXES
Add indexes for:
```prisma
@@index([email])
@@index([latitude, longitude])
@@index([userId, createdAt])
@@index([platform, scrapedAt])
```

4. MIGRATIONS
Generate migration scripts for:
- Adding missing fields
- Creating indexes
- Adding constraints
- Seeding initial data

5. QUERY OPTIMIZATION
Review common queries and optimize:
```typescript
// Get user with preferences and collections
// Is this N+1 query optimized?
prisma.user.findUnique({
  where: { id },
  include: {
    preferences: true,
    collections: {
      include: {
        items: true
      }
    }
  }
})
```

6. DELIVERABLES
Provide:
- Corrected schema.prisma file
- Migration SQL scripts
- Seed data script
- Query optimization examples
- Database backup strategy

CRITICAL: Ensure schema supports location-based queries efficiently.
```

---

# PROMPT 5: Authentication & Authorization Flow

```
You are a security engineer hardening OmniCart's auth system.

TASK: Audit and enhance authentication implementation:

1. JWT STRATEGY REVIEW
Check:
- [ ] JWT secret in environment variables (not hardcoded)
- [ ] Token expiration time (recommend: 7 days)
- [ ] Refresh token implementation
- [ ] Token payload (user id, email, role)
- [ ] Secure token storage (httpOnly cookies vs localStorage)

2. AUTH ENDPOINTS
Verify existence and security:
- POST /auth/register
  - Email validation
  - Password hashing (bcrypt rounds >= 10)
  - Duplicate email check
  - Email verification flow
  
- POST /auth/login
  - Rate limiting (max 5 attempts/15min)
  - Credential validation
  - Token generation
  - Last login timestamp update
  
- POST /auth/logout
  - Token invalidation
  - Refresh token cleanup
  
- POST /auth/refresh
  - Refresh token validation
  - New access token generation
  
- POST /auth/forgot-password
  - Email verification
  - Reset token generation
  - Expiration (1 hour)

3. GUARD IMPLEMENTATION
Check NestJS guards:
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user
}
```

Verify guards on:
- User profile endpoints
- Collection CRUD
- Preferences update
- Order history

4. PASSWORD SECURITY
Ensure:
- Minimum 8 characters
- Complexity requirements
- Bcrypt hashing (never plain text)
- Password reset flow secure

5. RATE LIMITING
Implement:
- Login: 5 attempts per 15 minutes
- API calls: 100 requests per minute
- Scraping triggers: 20 per minute per user

6. CORS CONFIGURATION
Verify:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

DELIVERABLE: Hardened auth system with security best practices.
```

---

# PROMPT 6: Frontend-Backend Connection Testing

```
You are a QA engineer creating comprehensive integration tests.

TASK: Build end-to-end test suite for frontend-backend communication:

1. API CLIENT SETUP
Verify frontend has:
- Axios/Fetch wrapper with base URL
- Request interceptor (add auth token)
- Response interceptor (handle 401, refresh token)
- Error handling wrapper
- Retry logic for failed requests

Example structure:
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error)
  }
)
```

2. TEST SCENARIOS
Create tests for:

USER FLOW 1: Registration & Login
- [ ] POST /auth/register with valid data → 201
- [ ] POST /auth/register with duplicate email → 409
- [ ] POST /auth/login with valid credentials → 200 + token
- [ ] POST /auth/login with invalid credentials → 401
- [ ] Verify token stored correctly
- [ ] Verify protected routes accessible

USER FLOW 2: Location Detection
- [ ] Frontend captures location
- [ ] POST /location/validate → 200 with service available
- [ ] POST /location/save (authenticated) → 200
- [ ] Verify location persisted in database
- [ ] Search uses saved location

USER FLOW 3: Product Search
- [ ] User enters "milk" in search bar
- [ ] Frontend calls POST /products/search with:
  ```json
  {
    "query": "milk",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "city": "Bengaluru"
  }
  ```
- [ ] Backend triggers scraping for all 5 platforms
- [ ] Response returns within 15 seconds
- [ ] Data normalized correctly
- [ ] Frontend displays cards in grid

USER FLOW 4: Cart Management
- [ ] User adds product to cart
- [ ] POST /cart/add → 200
- [ ] Cart state persisted (database or session)
- [ ] Cart optimization endpoint works
- [ ] Checkout flow initiated

3. ERROR HANDLING TESTS
Simulate:
- Network timeout → Show retry button
- 500 server error → Show error message
- Invalid token → Redirect to login
- Location denied → Show manual entry
- No products found → Show empty state

4. PERFORMANCE TESTS
Measure:
- Time from search to results display (< 3 seconds)
- Image loading optimization (lazy load)
- API response times (< 1 second for cached)
- Concurrent user handling (100 users)

5. DELIVERABLES
Provide:
- Jest/Vitest test suite
- Cypress E2E tests
- API mock server for development
- Test coverage report (aim for >80%)
- Performance benchmarks

CRITICAL: Every frontend component must successfully call its backend endpoint.
```

---

# PROMPT 7: Environment Variables & Configuration Management

```
You are a DevOps engineer setting up OmniCart's configuration.

TASK: Audit and organize all environment variables:

1. BACKEND .env FILE
Create complete template:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/omnicart"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRATION="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# API Keys (Scraping)
APIFY_API_KEY="your-apify-key"
PLAYWRIGHT_PROXY_URL=""

# Platform APIs (if using official APIs)
SWIGGY_API_KEY=""
BLINKIT_API_KEY=""
ZEPTO_API_KEY=""
BIGBASKET_API_KEY=""
AMAZON_API_KEY=""

# External Services
GEOCODING_API_KEY="" # For reverse geocoding
IPAPI_KEY="" # For IP-based location

# Email (for auth)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW="15m"
RATE_LIMIT_MAX_REQUESTS=100

# Caching
CACHE_TTL=300 # 5 minutes in seconds

# Logging
LOG_LEVEL="info"
```

2. FRONTEND .env FILE
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="" # For map displays
NEXT_PUBLIC_ENV="development"
```

3. VALIDATION
Add environment validation on app startup:
```typescript
// src/config/env.validation.ts
import { plainToClass } from 'class-transformer'
import { IsString, IsNumber, validateSync } from 'class-validator'

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string

  @IsString()
  JWT_SECRET: string

  @IsNumber()
  PORT: number

  @IsString()
  REDIS_HOST: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
```

4. CONFIGURATION MODULE
Organize configs:
```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  scraping: {
    timeout: 15000,
    retries: 3,
    cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 300,
  },
})
```

5. SECRETS MANAGEMENT
For production:
- Use AWS Secrets Manager / Google Secret Manager
- Never commit .env to git
- Rotate secrets every 90 days
- Use different keys per environment

DELIVERABLE: Complete environment setup documentation.
```

---

# PROMPT 8: API Response Standardization

```
You are an API designer ensuring consistent response formats across OmniCart.

TASK: Standardize all API responses:

1. SUCCESS RESPONSE FORMAT
```typescript
interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  metadata?: {
    timestamp: string
    requestId: string
    pagination?: {
      page: number
      limit: number
      total: number
      hasMore: boolean
    }
  }
}
```

Example:
```json
{
  "success": true,
  "data": {
    "products": [...]
  },
  "metadata": {
    "timestamp": "2026-05-23T10:30:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasMore": true
    }
  }
}
```

2. ERROR RESPONSE FORMAT
```typescript
interface ApiErrorResponse {
  success: false
  error: {
    code: string // VALIDATION_ERROR, AUTH_ERROR, NOT_FOUND, etc.
    message: string // Human-readable
    details?: any // Field-level errors
  }
  metadata: {
    timestamp: string
    requestId: string
  }
}
```

Example:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  },
  "metadata": {
    "timestamp": "2026-05-23T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

3. HTTP STATUS CODES
Enforce consistent usage:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (valid token, insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error
- 503: Service Unavailable (scraping timeout)

4. GLOBAL EXCEPTION FILTER
Implement NestJS exception filter:
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getErrorMessage(exception),
        details: this.getErrorDetails(exception)
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: request.id || generateRequestId()
      }
    }

    response.status(status).json(errorResponse)
  }
}
```

5. FRONTEND API CLIENT UPDATE
Update to handle new format:
```typescript
const searchProducts = async (query: string) => {
  try {
    const response = await api.post('/products/search', {
      query,
      ...location
    })

    if (response.data.success) {
      return response.data.data.products
    }
  } catch (error) {
    if (error.response?.data?.error) {
      const { code, message } = error.response.data.error
      toast.error(message)
      // Handle specific error codes
      if (code === 'LOCATION_REQUIRED') {
        // Show location modal
      }
    }
  }
}
```

DELIVERABLE: Refactor all endpoints to use standard format + frontend updates.
```

---

# PROMPT 9: Logging & Monitoring Setup

```
You are a Site Reliability Engineer implementing observability for OmniCart.

TASK: Set up comprehensive logging and monitoring:

1. STRUCTURED LOGGING
Implement using Winston:
```typescript
// src/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common'
import * as winston from 'winston'

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    })
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context })
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context })
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context })
  }
}
```

2. CRITICAL LOG POINTS
Add logging for:
- API request/response (middleware)
- Authentication attempts (success/failure)
- Scraping job start/end/errors
- Database queries (slow query log >1s)
- Cache hits/misses
- Rate limit violations
- Location validation results
- Payment processing (if implemented)

3. REQUEST TRACKING
Add request ID middleware:
```typescript
app.use((req, res, next) => {
  req.id = crypto.randomUUID()
  res.setHeader('X-Request-Id', req.id)
  logger.log(`${req.method} ${req.path}`, { requestId: req.id })
  next()
})
```

4. PERFORMANCE MONITORING
Track:
- API endpoint response times
- Database query times
- Scraping duration per platform
- Cache hit rate
- Memory usage
- CPU usage

5. ERROR TRACKING
Integrate Sentry:
```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

6. HEALTH CHECK ENDPOINT
```typescript
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      scraping: await this.checkScrapingServices()
    }
  }
}
```

7. ALERTING RULES
Set up alerts for:
- Error rate > 5% in 5 minutes
- API latency > 3 seconds
- Database connection failures
- Redis connection failures
- Scraping failures > 50% for any platform
- Memory usage > 80%

DELIVERABLE: Production-ready logging and monitoring system.
```

---

# PROMPT 10: Final Integration Testing & Deployment Checklist

```
You are a tech lead conducting final pre-launch review of OmniCart.

TASK: Create comprehensive deployment checklist:

1. FRONTEND CHECKLIST
- [ ] All API calls use correct endpoints
- [ ] Loading states for all async operations
- [ ] Error boundaries implemented
- [ ] Toast notifications for user feedback
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Location permission flow works
- [ ] Search autocomplete functional
- [ ] Product cards render correctly
- [ ] Cart management works
- [ ] Authentication flow complete
- [ ] Protected routes redirect properly
- [ ] Environment variables configured
- [ ] Build succeeds with no warnings
- [ ] Lighthouse score > 90

2. BACKEND CHECKLIST
- [ ] All endpoints respond correctly
- [ ] Database migrations run successfully
- [ ] Prisma schema matches database
- [ ] JWT auth works end-to-end
- [ ] Location validation functional
- [ ] Scraping adapters for all 5 platforms work
- [ ] Redis caching operational
- [ ] Rate limiting enforced
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Health check endpoint works
- [ ] CORS configured correctly
- [ ] Environment variables validated
- [ ] Database indexes created
- [ ] Backup strategy in place

3. INTEGRATION TESTS
Run end-to-end scenarios:
- [ ] User registration → Login → Search → Add to cart → Optimize
- [ ] Location denied → Manual entry → Search works
- [ ] Network timeout → Retry mechanism works
- [ ] Platform scraping fails → Partial results shown
- [ ] Rate limit hit → 429 response → Frontend shows message
- [ ] Token expiry → Refresh token → Continue session
- [ ] Concurrent users (simulate 100) → No crashes

4. SECURITY AUDIT
- [ ] Passwords hashed with bcrypt
- [ ] JWT secrets not exposed
- [ ] HTTPS enforced (production)
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevention (sanitize inputs)
- [ ] CSRF protection
- [ ] Rate limiting active
- [ ] Sensitive data not logged
- [ ] API keys in environment variables
- [ ] Database credentials secure

5. PERFORMANCE OPTIMIZATION
- [ ] Database query optimization
- [ ] Redis caching reduces load
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting implemented
- [ ] Bundle size < 500KB
- [ ] API responses < 1s (cached)
- [ ] API responses < 15s (live scraping)
- [ ] Lazy loading for images
- [ ] Debounced search input

6. DEPLOYMENT STEPS
Document:
```bash
# Backend deployment
1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure environment variables
4. Run database migrations: npx prisma migrate deploy
5. Build: npm run build
6. Start: npm run start:prod
7. Verify health check: curl https://api.omnicart.com/health

# Frontend deployment (Vercel)
1. Connect GitHub repo
2. Configure environment variables
3. Set build command: npm run build
4. Deploy
5. Verify: https://omnicart.com

# Post-deployment
1. Monitor error rates (Sentry)
2. Check API latency (CloudWatch/Datadog)
3. Verify scraping success rate
4. Test from multiple locations
```

7. ROLLBACK PLAN
If issues arise:
- [ ] Database backup available
- [ ] Previous Docker image tagged
- [ ] DNS can point to old version
- [ ] Redis can be flushed if needed

8. MONITORING DASHBOARD
Set up tracking for:
- Active users
- Search queries per minute
- Scraping success/failure rates
- API response times
- Error rates
- Platform-wise performance

DELIVERABLE: Go/No-Go decision report with all checks marked.
```

---

# BONUS PROMPT: Performance & Scalability Optimization

```
You are a performance engineer preparing OmniCart for scale.

TASK: Optimize the system for 10,000+ concurrent users:

1. DATABASE OPTIMIZATION
- Add connection pooling (max 20 connections)
- Implement read replicas for heavy queries
- Add database indexes on:
  - users(email)
  - users(latitude, longitude)
  - searchHistory(userId, createdAt)
  - collections(userId)
  
2. CACHING STRATEGY
Layer 1: Browser cache (1 hour for images)
Layer 2: Redis (5-10 min for price data)
Layer 3: CDN (static assets)

3. SCRAPING OPTIMIZATION
- Queue system with priority (user searches > background)
- Batch similar searches (same product, nearby locations)
- Use cached results aggressively
- Implement circuit breaker (stop scraping platform if 80% fail)

4. FRONTEND OPTIMIZATION
- Virtualized lists for long product grids (react-window)
- Optimistic UI updates (instant feedback)
- Prefetch on hover
- Service worker for offline support

5. INFRASTRUCTURE
- Auto-scaling (2-10 backend instances)
- Load balancer (round-robin)
- Database read replicas
- CDN for static assets

DELIVERABLE: Scalability roadmap with benchmarks.
```

---

## 🎯 EXECUTION ORDER

Run these prompts in sequence:
1. API Audit (Foundation)
2. Location Services (Critical feature)
3. Scraping Pipeline (Core functionality)
4. Database Schema (Data integrity)
5. Authentication (Security)
6. Frontend-Backend Testing (Integration)
7. Environment Setup (Configuration)
8. Response Standardization (Consistency)
9. Logging & Monitoring (Observability)
10. Final Checklist (Launch readiness)

**Each prompt is self-contained and produces actionable deliverables. Feed the backend codebase to an AI assistant with these prompts to get production-ready enhancements.**