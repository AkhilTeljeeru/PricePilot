const { scrapeCroma, scrapeReliance, scrapeJioMart, scrapeMeesho } = require('./scrapers');

(async () => {
  console.log("Testing Croma...");
  const c = await scrapeCroma("iphone 15");
  console.log("Croma:", c.length, "items");
  
  console.log("Testing Reliance...");
  const r = await scrapeReliance("iphone 15");
  console.log("Reliance:", r.length, "items");
  
  console.log("Testing JioMart...");
  const j = await scrapeJioMart("iphone 15");
  console.log("JioMart:", j.length, "items");
  
  console.log("Testing Meesho...");
  const m = await scrapeMeesho("iphone 15");
  console.log("Meesho:", m.length, "items");
  
  process.exit(0);
})();
