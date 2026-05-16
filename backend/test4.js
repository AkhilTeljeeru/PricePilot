const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const p = await browser.newPage();
  await p.goto('https://www.flipkart.com/search?q=shirt', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[data-id]')).slice(0, 3);
    return items.map(el => {
      const imgEl = el.querySelector('img');
      return { 
        img: imgEl ? imgEl.getAttribute('src') : null,
        title: el.innerText.split('\n')[0] 
      };
    });
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
