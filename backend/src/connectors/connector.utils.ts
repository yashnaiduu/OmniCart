import { Logger } from '@nestjs/common';

/**
 * Shared utilities for connectors
 * Provides User-Agent rotation, header generation, and common parsing helpers
 */

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getBrowserHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    ...extra,
  };
}

/**
 * Safe JSON fetch with timeout and error handling.
 * Returns null on any failure — connector should return [] in that case.
 */
export async function safeFetch(
  url: string,
  options: {
    headers?: Record<string, string>;
    timeoutMs?: number;
    method?: 'GET' | 'POST';
    body?: string;
  } = {},
): Promise<any | null> {
  const { headers = {}, timeoutMs = 800, method = 'GET', body } = options;
  const logger = new Logger('safeFetch');
  try {
    const { gotScraping } = await import('got-scraping');
    const response = await gotScraping({
      url,
      method: method as any,
      headers: getBrowserHeaders(headers),
      body,
      timeout: { request: timeoutMs },
      responseType: 'json',
      retry: { limit: 0 },
      throwHttpErrors: false,
    });

    if (response.statusCode >= 400) {
      logger.error(`HTTP Error ${response.statusCode} for URL: ${url}`);
      return null;
    }
    return response.body;
  } catch (err: any) {
    // If it fails to parse JSON, it might be HTML (like Amazon). Let's try raw fetch fallback for HTML.
    if (err.message?.includes('JSON') || err.message?.includes('Unexpected token')) {
      try {
        const { gotScraping } = await import('got-scraping');
        const raw = await gotScraping({
          url,
          method: method as any,
          headers: getBrowserHeaders(headers),
          body,
          timeout: { request: timeoutMs },
          retry: { limit: 0 },
        });
        return { __rawHtml: raw.body };
      } catch {
        return null; // give up
      }
    }
    logger.error(`gotScraping failed for URL: ${url}. Error: ${err.message}`);
    return null;
  }
}

/**
 * Add a small random delay to mimic human behavior
 * Per 08_CONNECTORS_SPEC.md §8 — 50-150ms delay
 */
export async function humanDelay(): Promise<void> {
  const ms = 50 + Math.random() * 100;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
