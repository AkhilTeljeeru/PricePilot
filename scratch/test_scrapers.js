const { scrapeAmazon, scrapeFlipkart, scrapeMyntra } = require('../backend/scrapers');

(async () => {
  console.log("Testing Amazon...");
  const amazon = await scrapeAmazon("iphone 15");
  console.log("Amazon:", JSON.stringify(amazon, null, 2));

  console.log("Testing Flipkart...");
  const flipkart = await scrapeFlipkart("iphone 15");
  console.log("Flipkart:", JSON.stringify(flipkart, null, 2));

  console.log("Testing Myntra...");
  const myntra = await scrapeMyntra("nike running shoes");
  console.log("Myntra:", JSON.stringify(myntra, null, 2));
  
  process.exit(0);
})();
