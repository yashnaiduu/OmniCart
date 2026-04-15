import { Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * BrowserPool — Singleton headless Chrome manager
 * Reuses a single browser instance across all connector calls.
 * Provides fresh pages with stealth settings for each scrape.
 */
const logger = new Logger('BrowserPool');

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  logger.log('Launching headless Chrome...');
  browserInstance = await puppeteer.launch({
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
    logger.warn('Chrome disconnected — will relaunch on next request');
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Open a fresh page with common stealth overrides
 */
export async function getStealthPage(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Set a realistic viewport and user agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  );

  // Block unnecessary resources to speed up page loads
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const blocked = ['image', 'stylesheet', 'font', 'media'];
    if (blocked.includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return page;
}

/**
 * Scrape a page: navigate, wait for content, extract via evaluator function
 */
export async function scrapePage<T>(
  url: string,
  evaluator: (page: Page) => Promise<T>,
  waitMs = 5000,
): Promise<T | null> {
  let page: Page | null = null;
  try {
    page = await getStealthPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Wait for dynamic JS content to render
    await new Promise((r) => setTimeout(r, waitMs));
    const result = await evaluator(page);
    return result;
  } catch (err: any) {
    logger.error(`Scrape failed for ${url}: ${err.message}`);
    return null;
  } finally {
    if (page) {
      try { await page.close(); } catch { /* ignore */ }
    }
  }
}
