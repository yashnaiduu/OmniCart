import { Logger } from '@nestjs/common';
import { chromium } from 'playwright-extra';
import type { Browser, Page, BrowserContext, Route } from 'playwright';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

/**
 * BrowserPool — Singleton headless Chromium manager (Playwright + Stealth)
 *
 * Replaces Puppeteer with playwright-extra + stealth plugin for robust
 * anti-bot evasion. Provides:
 * - Stealth browser launch (passes bot detection)
 * - Fresh browser contexts with geolocation injection
 * - API interception helper for capturing internal JSON responses
 */
const logger = new Logger('BrowserPool');

// Apply stealth plugin once
chromium.use(StealthPlugin());

let browserInstance: Browser | null = null;

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  logger.log('Launching stealth Chromium via Playwright...');
  browserInstance = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080',
    ],
  });

  browserInstance.on('disconnected', () => {
    logger.warn('Chromium disconnected — will relaunch on next request');
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Create a fresh browser context with stealth settings and optional geolocation
 */
export async function createStealthContext(
  lat?: number,
  lng?: number,
): Promise<BrowserContext> {
  const browser = await getBrowser();

  const contextOptions: any = {
    userAgent: randomUserAgent(),
    viewport: { width: 1920, height: 1080 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    ignoreHTTPSErrors: true,
  };

  if (lat !== undefined && lng !== undefined) {
    contextOptions.geolocation = { latitude: lat, longitude: lng };
    contextOptions.permissions = ['geolocation'];
  }

  return browser.newContext(contextOptions);
}

/**
 * Open a fresh stealth page from a new context
 */
export async function getStealthPage(
  lat?: number,
  lng?: number,
): Promise<{ page: Page; context: BrowserContext }> {
  const context = await createStealthContext(lat, lng);
  const page = await context.newPage();

  // Block unnecessary resources to speed up page loads
  await page.route('**/*', (route: Route) => {
    const type = route.request().resourceType();
    if (['image', 'stylesheet', 'font', 'media', 'other'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  return { page, context };
}

/**
 * Intercept API responses matching a URL pattern.
 * Returns a promise that resolves with the first matching JSON response body.
 * Resolves with null on timeout (does NOT reject — prevents unhandled crashes).
 */
export function interceptApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeoutMs = 15000,
): Promise<any | null> {
  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, timeoutMs);

    page.on('response', async (response) => {
      if (resolved) return;
      try {
        const url = response.url();
        const matches =
          typeof urlPattern === 'string'
            ? url.includes(urlPattern)
            : urlPattern.test(url);

        if (matches && response.status() === 200) {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json')) {
            clearTimeout(timer);
            if (!resolved) {
              resolved = true;
              const body = await response.json();
              resolve(body);
            }
          }
        }
      } catch {
        // Ignore individual response parse errors
      }
    });
  });
}

/**
 * Collect multiple API responses matching a URL pattern over a duration.
 */
export function collectApiResponses(
  page: Page,
  urlPattern: string | RegExp,
  durationMs = 10000,
): Promise<any[]> {
  return new Promise((resolve) => {
    const results: any[] = [];

    page.on('response', async (response) => {
      try {
        const url = response.url();
        const matches =
          typeof urlPattern === 'string'
            ? url.includes(urlPattern)
            : urlPattern.test(url);

        if (matches && response.status() === 200) {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json')) {
            const body = await response.json();
            results.push(body);
          }
        }
      } catch {
        // Ignore
      }
    });

    setTimeout(() => resolve(results), durationMs);
  });
}

/**
 * High-level scrape helper: open stealth page, navigate, extract via evaluator.
 * Falls back to null on error.
 */
export async function scrapePage<T>(
  url: string,
  evaluator: (page: Page) => Promise<T>,
  waitMs = 5000,
  lat?: number,
  lng?: number,
): Promise<T | null> {
  let context: BrowserContext | null = null;
  try {
    const result = await getStealthPage(lat, lng);
    context = result.context;
    const page = result.page;

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(1000); // Only a small delay for dom fallback
    const data = await evaluator(page);
    return data;
  } catch (err: any) {
    logger.error(`Scrape failed for ${url}: ${err.message}`);
    return null;
  } finally {
    if (context) {
      try { await context.close(); } catch { /* ignore */ }
    }
  }
}

/**
 * Advanced scrape: navigate with API interception + DOM evaluator fallback.
 * Falls back to DOM if:
 * - API interception times out (returns null)
 * - API transformer returns empty array
 * - Any error occurs
 */
export async function scrapeWithApiInterception<T>(
  url: string,
  apiPattern: string | RegExp,
  apiTransformer: (apiData: any) => T,
  domFallback: (page: Page) => Promise<T>,
  waitMs = 2500,
  lat?: number,
  lng?: number,
): Promise<T | null> {
  let attempt = 0;
  const maxRetries = 1; // Reduce retries to speed up failures

  while (attempt <= maxRetries) {
    let context: BrowserContext | null = null;
    try {
      const { page, context: ctx } = await getStealthPage(lat, lng);
      context = ctx;

      // Inject cookies for platforms that block based on location
      if (url.includes('swiggy.com')) {
        const swiggyLocation = { lat: lat || 13.0827, lng: lng || 80.2707, address: 'India', city: 'Chennai' };
        await context.addCookies([
          { name: 'userLocation', value: encodeURIComponent(JSON.stringify(swiggyLocation)), domain: '.swiggy.com', path: '/' },
          { name: 'lat', value: String(swiggyLocation.lat), domain: '.swiggy.com', path: '/' },
          { name: 'lng', value: String(swiggyLocation.lng), domain: '.swiggy.com', path: '/' }
        ]);
      }

      // Start listening before navigation with the full timeout
      const apiPromise = interceptApiResponse(page, apiPattern, waitMs)
        .catch(() => null); // Safety net — never reject

      // Navigate and wait for DOM, but don't crash on timeout
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 6000 }).catch(() => null);

      // Try API interception first. Will resolve instantly if the API call completes!
      const apiData = await apiPromise;

      if (apiData) {
        try {
          const result = apiTransformer(apiData);
          const isEmpty = Array.isArray(result) ? result.length === 0 : !result;
          if (!isEmpty) {
            logger.log(`API interception succeeded for pattern: ${apiPattern} (attempt ${attempt + 1})`);
            return result;
          }
          logger.warn(`API interception returned empty for ${apiPattern}, falling back to DOM`);
        } catch (err: any) {
          logger.warn(`API transformer failed: ${err.message}, falling back to DOM`);
        }
      } else {
        logger.warn(`API interception timed out for ${apiPattern}, falling back to DOM`);
      }

      // DOM fallback
      const domResult = await domFallback(page);
      const isDomEmpty = Array.isArray(domResult) ? domResult.length === 0 : !domResult;
      
      if (!isDomEmpty) {
        return domResult;
      }
      
      throw new Error('Both API and DOM extraction yielded empty results');

    } catch (err: any) {
      attempt++;
      logger.error(`scrapeWithApiInterception attempt ${attempt} failed for ${url}: ${err.message}`);
      
      if (attempt <= maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        logger.log(`Retrying in ${Math.round(backoffMs)}ms...`);
        await new Promise(res => setTimeout(res, backoffMs));
      } else {
        return null;
      }
    } finally {
      if (context) {
        try { await context.close(); } catch { /* ignore */ }
      }
    }
  }
  return null;
}

