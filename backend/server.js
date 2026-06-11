require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { scrapeAmazon, scrapeFlipkart, scrapeCroma, scrapeMyntra, scrapeAjio, scrapeSnapdeal, scrapeNykaa, scrapeReliance, scrapeJioMart, scrapeMeesho } = require('./scrapers');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://www.typingmind.com'
].filter(Boolean);

const corsOptionsDelegate = function (req, callback) {
  const origin = req.header('Origin');
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  
  // Whitelist specific IPs (e.g. TypingMind backend)
  const isAllowedIp = clientIp.includes('74.220.48.') || clientIp.includes('74.220.56.');

  if (
    !origin || 
    isAllowedIp ||
    origin.endsWith('.vercel.app') || 
    allowedOrigins.includes(origin)
  ) {
    callback(null, { origin: true });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptionsDelegate));

app.use(express.json());

// Helper function to timeout promises
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Scraping timeout')), ms))
  ]);
};

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  console.log(`Received search request for: "${query}"`);

  // Map of available scrapers
  const scrapersMap = {
    amazon: scrapeAmazon,
    flipkart: scrapeFlipkart,
    croma: scrapeCroma,
    myntra: scrapeMyntra,
    ajio: scrapeAjio,
    snapdeal: scrapeSnapdeal,
    nykaa: scrapeNykaa,
    reliance_digital: scrapeReliance,
    jiomart: scrapeJioMart,
    meesho: scrapeMeesho
  };

  const requestedPlatforms = req.query.platforms ? req.query.platforms.split(',') : Object.keys(scrapersMap);
  const tasksToRun = requestedPlatforms.filter(p => scrapersMap[p]).map(p => ({ name: p, fn: scrapersMap[p] }));

  // Run scrapers in batches of 3 to avoid crashing the browser/CPU
  const TIMEOUT_MS = 25000;
  const results = [];
  
  for (let i = 0; i < tasksToRun.length; i += 3) {
    const batch = tasksToRun.slice(i, i + 3);
    console.log(`Running batch: ${batch.map(b => b.name).join(', ')}`);
    
    const batchPromises = batch.map(task => withTimeout(task.fn(query), TIMEOUT_MS));
    const settled = await Promise.allSettled(batchPromises);
    
    settled.forEach((result, index) => {
      const pName = batch[index].name;
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        results.push(...result.value.map(r => ({ ...r, platform: pName })));
      } else {
        console.error(`${pName} scraping failed or timed out:`, result.reason);
      }
    });
  }

  res.json({ results });
});

app.post('/api/llm', async (req, res) => {
  try {
    const { prompt, response_json_schema } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const fullPrompt = `${prompt}\n\nYou MUST respond in valid JSON matching this schema:\n${JSON.stringify(response_json_schema)}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: fullPrompt }],
      response_format: { type: "json_object" },
    });
    
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: 'Failed to process LLM request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
