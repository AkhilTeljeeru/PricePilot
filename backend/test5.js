const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function testPlatform(browser, url, selector, waitSelector) {
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (waitSelector) await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(()=>console.log('Timeout waiting for', waitSelector));
    const count = await page.evaluate((sel) => document.querySelectorAll(sel).length, selector);
    console.log(`URL: ${url} -> Count: ${count}`);
  } catch (e) {
    console.log(`Error on ${url}: ${e.message}`);
  }
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  await testPlatform(browser, 'https://www.croma.com/searchB?q=phone', '.product-item', '.product-item');
  await testPlatform(browser, 'https://www.reliancedigital.in/search?q=phone', '.sp__product', '.sp__product');
  await testPlatform(browser, 'https://www.myntra.com/shirt', '.product-base', '.product-base');
  await testPlatform(browser, 'https://www.ajio.com/search/?text=shirt', '.item', '.item');
  await testPlatform(browser, 'https://www.snapdeal.com/search?keyword=shirt', '.product-tuple-listing', '.product-tuple-listing');
  await testPlatform(browser, 'https://www.nykaa.com/search/result/?q=shirt', '.product-list-box, .css-xrzmfa', null);
  await testPlatform(browser, 'https://www.jiomart.com/search/shirt', '.plp-card-container, .ais-InfiniteHits-item', null);
  await testPlatform(browser, 'https://www.meesho.com/search?q=shirt', '.ProductList__GridCard-sc-8lnc8o-0', null);
  await browser.close();
})();
