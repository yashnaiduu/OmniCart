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
    if (['stylesheet', 'font', 'media'].includes(type)) {
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
 */
export function interceptApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeoutMs = 15000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`API interception timed out after ${timeoutMs}ms for pattern: ${urlPattern}`));
    }, timeoutMs);

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
            clearTimeout(timer);
            const body = await response.json();
            resolve(body);
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

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(waitMs);
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
 * Advanced scrape: navigate with API interception + DOM evaluator fallback
 */
export async function scrapeWithApiInterception<T>(
  url: string,
  apiPattern: string | RegExp,
  apiTransformer: (apiData: any) => T,
  domFallback: (page: Page) => Promise<T>,
  waitMs = 8000,
  lat?: number,
  lng?: number,
): Promise<T | null> {
  let context: BrowserContext | null = null;
  try {
    const { page, context: ctx } = await getStealthPage(lat, lng);
    context = ctx;

    // Start listening before navigation
    const apiPromise = interceptApiResponse(page, apiPattern, waitMs + 5000);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(waitMs);

    // Try API interception first
    try {
      const apiData = await apiPromise;
      logger.log(`API interception succeeded for pattern: ${apiPattern}`);
      return apiTransformer(apiData);
    } catch {
      // API interception failed/timed out — fall back to DOM
      logger.warn(`API interception failed for ${apiPattern}, falling back to DOM scraping`);
      return await domFallback(page);
    }
  } catch (err: any) {
    logger.error(`scrapeWithApiInterception failed for ${url}: ${err.message}`);
    return null;
  } finally {
    if (context) {
      try { await context.close(); } catch { /* ignore */ }
    }
  }
}
