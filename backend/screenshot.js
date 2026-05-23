const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
chromium.use(StealthPlugin());

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  console.log('Navigating to comparify.pro...');
  await page.goto('https://comparify.pro/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: '/Users/yashnaidu/.gemini/antigravity-ide/brain/a9eaa0d8-5999-4dbe-a239-47deeaee10c2/comparify_screenshot.png', fullPage: true });
  console.log('Screenshot saved.');
  await browser.close();
})();
