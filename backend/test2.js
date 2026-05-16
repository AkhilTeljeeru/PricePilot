const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const p = await browser.newPage();
  await p.goto('https://www.flipkart.com/search?q=shirt', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[data-id], a[href*="/p/"]')).slice(0, 5);
    return items.map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.innerText.replace(/\n/g, ' ').substring(0, 100),
      html: el.innerHTML.substring(0, 150)
    }));
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
