const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const p = await browser.newPage();
  await p.goto('https://www.flipkart.com/search?q=shirt', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => {
    // Try to find the wrapper for a product. Usually it has a link to the product.
    const items = Array.from(document.querySelectorAll('div[data-id], div[class*="slAVV4"], a[href*="/p/"]')).slice(0, 5);
    return items.map(el => {
      // Find title
      let title = el.querySelector('.s1Q9rs, a[title], div.KzDlHZ, a.wjcEIp, a.VJA30P, a.WKTcLC, a.atJtCj');
      title = title ? (title.getAttribute('title') || title.innerText) : el.innerText.split('\n')[0];
      
      // Find price
      let price = el.querySelector('div._30jeq3, div.Nx9bqj, div.hZ3P6w');
      price = price ? price.innerText : '';

      return { title, price, html: el.innerHTML.substring(0,200) };
    });
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
