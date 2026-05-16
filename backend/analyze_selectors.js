const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

async function testSite(url, siteName) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log(`Testing ${siteName}...`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    const html = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
    console.log(`${siteName} HTML snippet length: ${html.length}`);
    
    // Attempt to dump class names that might be products
    const classes = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('div, li, a'));
      const classMap = {};
      els.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          classMap[el.className] = (classMap[el.className] || 0) + 1;
        }
      });
      return Object.entries(classMap).sort((a,b) => b[1] - a[1]).slice(0, 30);
    });
    console.log(`${siteName} common classes:`, classes);
    
  } catch (err) {
    console.error(`Error on ${siteName}:`, err.message);
  }
  await browser.close();
}

(async () => {
  await testSite('https://www.croma.com/searchB?q=iphone%2015', 'Croma');
  await testSite('https://www.reliancedigital.in/search?q=iphone%2015', 'Reliance');
  await testSite('https://www.jiomart.com/search/iphone%2015', 'JioMart');
  await testSite('https://www.meesho.com/search?q=iphone%2015', 'Meesho');
})();
