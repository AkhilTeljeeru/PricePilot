const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

let globalBrowser = null;

async function getBrowser() {
  if (!globalBrowser) {
    globalBrowser = await chromium.launch({ 
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-http2',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,720'
      ]
    });
  }
  return globalBrowser;
}

async function scrapePlatform(query, platformName, urlTemplate, extractFn, waitSelector = null) {
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    const url = urlTemplate.replace('{query}', encodeURIComponent(query));
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    if (waitSelector) {
      await page.waitForSelector(waitSelector, { timeout: 15000 }).catch(() => {});
    } else {
      await page.waitForTimeout(3000);
    }
    
    const results = await page.evaluate(extractFn, url);
    await context.close();
    return results || [];
  } catch (error) {
    console.error(`${platformName} scraping error:`, error.message);
    return [];
  }
}

async function scrapeAmazon(query) {
  return scrapePlatform(query, 'Amazon', 'https://www.amazon.in/s?k={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('[data-component-type="s-search-result"]')).slice(0, 8);
    return items.map(el => {
      let title = '';
      const titleEl1 = el.querySelector('h2 a span');
      const titleEl2 = el.querySelector('h2');
      if (titleEl1) title = titleEl1.innerText.trim();
      else if (titleEl2) title = titleEl2.innerText.trim();
      
      const priceEl = el.querySelector('.a-price-whole');
      const priceText = priceEl ? priceEl.innerText.split('.')[0].replace(/[^0-9]/g, '') : null;
      
      const mrpEl = el.querySelector('.a-text-price .a-offscreen');
      const mrpText = mrpEl ? mrpEl.innerText.split('.')[0].replace(/[^0-9]/g, '') : null;
      
      const linkEl = el.querySelector('h2 a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      const imageEl = el.querySelector('img.s-image');
      const image_url = imageEl ? imageEl.getAttribute('src') : null;

      if (!title || !priceText) return null;

      const price = parseInt(priceText, 10);
      let mrp = mrpText ? parseInt(mrpText, 10) : price;
      if (mrp < price) mrp = price;
      
      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.5, rating_count: 1000,
        delivery_info: "Prime Delivery", seller: "Amazon Retail",
        offers: ["Bank Offer"], in_stock: true,
        url: urlPath ? 'https://www.amazon.in' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, '[data-component-type="s-search-result"]');
}

async function scrapeFlipkart(query) {
  return scrapePlatform(query, 'Flipkart', 'https://www.flipkart.com/search?q={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('div[data-id], a.CGtC98')).slice(0, 8);
    return items.map(el => {
      let titleEl = el.querySelector('.s1Q9rs, a[title], div.KzDlHZ, a.wjcEIp, a.VJA30P, a.WKTcLC, a.atJtCj');
      let title = titleEl ? (titleEl.getAttribute('title') || titleEl.innerText.trim()) : el.innerText.split('\\n')[0];

      let priceText = '';
      const priceEl = el.querySelector('div.Nx9bqj, div._30jeq3, div.hZ3P6w, .a-price-whole, ._1vC4OE');
      if (priceEl) priceText = priceEl.innerText.split('.')[0].replace(/[^0-9]/g, '');

      let mrpText = '';
      const mrpEl = el.querySelector('div.yRaY8j, div._3I9_wc, div.kRYCnD');
      if (mrpEl) mrpText = mrpEl.innerText.split('.')[0].replace(/[^0-9]/g, '');

      let urlPath = '';
      if (el.tagName.toLowerCase() === 'a') urlPath = el.getAttribute('href');
      else {
          const linkEl = el.querySelector('a');
          if (linkEl) urlPath = linkEl.getAttribute('href');
      }

      let image_url = null;
      const imgEl = el.querySelector('img.DByuf4, img._396cs4, img');
      if (imgEl) image_url = imgEl.getAttribute('src');

      if (!title || !priceText) return null;

      const price = parseInt(priceText, 10);
      let mrp = mrpText ? parseInt(mrpText, 10) : price;
      if (mrp < price) mrp = price;

      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.3, rating_count: 500,
        delivery_info: "Free Delivery", seller: "RetailNet",
        offers: ["Bank Offer"], in_stock: true,
        url: urlPath ? 'https://www.flipkart.com' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, 'div[data-id], a.CGtC98');
}

async function scrapeMyntra(query) {
  return scrapePlatform(query, 'Myntra', 'https://www.myntra.com/{query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('.product-base')).slice(0, 8);
    return items.map(el => {
      const brand = el.querySelector('.product-brand')?.innerText || '';
      const product = el.querySelector('.product-product')?.innerText || '';
      const title = `${brand} ${product}`.trim();
      
      const priceText = el.querySelector('.product-discountedPrice')?.innerText.replace(/[^0-9]/g, '') || el.querySelector('.product-price')?.innerText.replace(/[^0-9]/g, '');
      const mrpText = el.querySelector('.product-strike')?.innerText.replace(/[^0-9]/g, '') || priceText;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('srcset')?.split(' ')[0]) : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      
      const price = parseInt(priceText, 10);
      const mrp = parseInt(mrpText, 10) || price;

      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.2, rating_count: 300,
        delivery_info: "Standard Delivery", seller: "Myntra Retail",
        offers: [], in_stock: true,
        url: urlPath ? 'https://www.myntra.com/' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, '.product-base');
}

async function scrapeAjio(query) {
  return scrapePlatform(query, 'Ajio', 'https://www.ajio.com/search/?text={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('.item')).slice(0, 8);
    return items.map(el => {
      const brand = el.querySelector('.brand')?.innerText || '';
      const name = el.querySelector('.nameCls')?.innerText || '';
      const title = `${brand} ${name}`.trim();
      
      const priceText = el.querySelector('.price')?.innerText.replace(/[^0-9]/g, '');
      const mrpText = el.querySelector('.orginal-price')?.innerText.replace(/[^0-9]/g, '') || priceText;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? imgEl.getAttribute('src') : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      
      const price = parseInt(priceText, 10);
      const mrp = parseInt(mrpText, 10) || price;

      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.1, rating_count: 200,
        delivery_info: "Standard Delivery", seller: "Ajio Retail",
        offers: [], in_stock: true,
        url: urlPath ? 'https://www.ajio.com' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, '.item');
}

async function scrapeSnapdeal(query) {
  return scrapePlatform(query, 'Snapdeal', 'https://www.snapdeal.com/search?keyword={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('.product-tuple-listing')).slice(0, 8);
    return items.map(el => {
      const title = el.querySelector('.product-title')?.innerText || '';
      const priceText = el.querySelector('.product-price')?.innerText.replace(/[^0-9]/g, '');
      const mrpText = el.querySelector('.product-desc-price')?.innerText.replace(/[^0-9]/g, '') || priceText;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src')) : null;
      
      const linkEl = el.querySelector('a.dp-widget-link');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      
      const price = parseInt(priceText, 10);
      const mrp = parseInt(mrpText, 10) || price;

      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.0, rating_count: 150,
        delivery_info: "Standard Delivery", seller: "Snapdeal Seller",
        offers: [], in_stock: true,
        url: urlPath || searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, '.product-tuple-listing');
}

async function scrapeNykaa(query) {
  return scrapePlatform(query, 'Nykaa', 'https://www.nykaa.com/search/result/?q={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('.product-list-box, .css-xrzmfa')).slice(0, 8);
    return items.map(el => {
      const title = el.querySelector('.css-x3m5in, .title')?.innerText || '';
      const priceText = el.querySelector('.css-111z9ua, .price')?.innerText.replace(/[^0-9]/g, '');
      const mrpText = el.querySelector('.css-u05qjg, .mrp')?.innerText.replace(/[^0-9]/g, '') || priceText;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? imgEl.getAttribute('src') : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      
      const price = parseInt(priceText, 10);
      const mrp = parseInt(mrpText, 10) || price;

      return {
        title, price, mrp,
        discount_percent: mrp > price ? Math.floor(((mrp - price) / mrp) * 100) : 0,
        rating: 4.4, rating_count: 400,
        delivery_info: "Standard Delivery", seller: "Nykaa Retail",
        offers: [], in_stock: true,
        url: urlPath ? 'https://www.nykaa.com' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  });
}

// Additional Platform Scrapers
async function scrapeCroma(query) {
  return scrapePlatform(query, 'Croma', 'https://www.croma.com/searchB?q={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('.product-item, .item, .typ-14')).slice(0, 8);
    return items.map(el => {
      const titleEl = el.querySelector('h3.product-title, .product-title, h3, a');
      const title = titleEl ? titleEl.innerText.trim() : '';
      
      const priceEl = el.querySelector('.amount, .new-price, .price');
      const priceText = priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : null;
      
      const imgEl = el.querySelector('.product-img img, img');
      const image_url = imgEl ? imgEl.getAttribute('src') : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      const price = parseInt(priceText, 10);
      
      return {
        title, price, mrp: price, discount_percent: 0,
        rating: 4.2, rating_count: 100, delivery_info: "Standard Delivery", seller: "Croma Retail", offers: [], in_stock: true,
        url: urlPath ? (urlPath.startsWith('http') ? urlPath : 'https://www.croma.com' + urlPath) : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, '.product-item, .item');
}

async function scrapeReliance(query) {
  return scrapePlatform(query, 'Reliance Digital', 'https://www.reliancedigital.in/search?q={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('li.product-item, div.sp__product, li.grid')).slice(0, 8);
    return items.map(el => {
      const titleEl = el.querySelector('p.product-title, .sp__name, p, .details-container > div');
      const title = titleEl ? titleEl.innerText.trim() : '';
      
      const priceEl = el.querySelector('span.price, .g-price, span[class*="price"], .TextWeb__Text-sc-1cyx778-0');
      const priceText = priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : null;
      
      const imgEl = el.querySelector('.product-card-image img, img');
      const image_url = imgEl ? imgEl.getAttribute('data-srcset') || imgEl.getAttribute('src') : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      const price = parseInt(priceText, 10);
      
      return {
        title, price, mrp: price, discount_percent: 0,
        rating: 4.3, rating_count: 120, delivery_info: "Standard Delivery", seller: "Reliance Retail", offers: [], in_stock: true,
        url: urlPath ? 'https://www.reliancedigital.in' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, 'li.product-item, div.sp__product');
}

async function scrapeJioMart(query) {
  return scrapePlatform(query, 'JioMart', 'https://www.jiomart.com/search/{query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('li.ais-Hits-item, .plp-card-container')).slice(0, 8);
    return items.map(el => {
      const titleEl = el.querySelector('.plp-card-details-name, .title');
      const title = titleEl ? titleEl.innerText.trim() : '';
      
      const priceEl = el.querySelector('.jm-heading-xxs, .price');
      const priceText = priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : null;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? imgEl.getAttribute('src') : null;
      
      const linkEl = el.querySelector('a');
      const urlPath = linkEl ? linkEl.getAttribute('href') : null;

      if (!title || !priceText) return null;
      const price = parseInt(priceText, 10);
      
      return {
        title, price, mrp: price, discount_percent: 0,
        rating: 4.1, rating_count: 90, delivery_info: "Standard Delivery", seller: "JioMart Retail", offers: [], in_stock: true,
        url: urlPath ? 'https://www.jiomart.com' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, 'li.ais-Hits-item, .plp-card-container');
}

async function scrapeMeesho(query) {
  return scrapePlatform(query, 'Meesho', 'https://www.meesho.com/search?q={query}', (searchUrl) => {
    const items = Array.from(document.querySelectorAll('div[class*="ProductListItem"], a[href*="/s/p/"]')).slice(0, 8);
    return items.map(el => {
      const titleEl = el.querySelector('p');
      const title = titleEl ? titleEl.innerText.trim() : '';
      
      const priceEl = el.querySelector('h5');
      const priceText = priceEl ? priceEl.innerText.replace(/[^0-9]/g, '') : null;
      
      const imgEl = el.querySelector('img');
      const image_url = imgEl ? imgEl.getAttribute('src') : null;
      
      let urlPath = el.tagName === 'A' ? el.getAttribute('href') : null;
      if (!urlPath) {
        const linkEl = el.querySelector('a');
        urlPath = linkEl ? linkEl.getAttribute('href') : null;
      }

      if (!title || !priceText) return null;
      const price = parseInt(priceText, 10);
      
      return {
        title, price, mrp: price, discount_percent: 0,
        rating: 4.0, rating_count: 50, delivery_info: "Free Delivery", seller: "Meesho Seller", offers: [], in_stock: true,
        url: urlPath ? 'https://www.meesho.com' + urlPath : searchUrl,
        image_url
      };
    }).filter(Boolean);
  }, 'div[class*="ProductListItem"], a[href*="/s/p/"]');
}

module.exports = {
  scrapeAmazon, scrapeFlipkart, scrapeMyntra, scrapeAjio, scrapeSnapdeal, scrapeNykaa, scrapeCroma, scrapeReliance, scrapeJioMart, scrapeMeesho
};
