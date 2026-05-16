const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

(async () => {
  const browser = await chromium.launch({ headless: false });
  const p = await browser.newPage();
  await p.goto('https://www.flipkart.com/search?q=ps5', {waitUntil: 'domcontentloaded'});
  const res = await p.evaluate(() => {
    return document.body.innerHTML.substring(0, 5000);
  });
  console.log(res);
  await browser.close();
})();
