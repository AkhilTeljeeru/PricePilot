require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
const { scrapeAmazon, scrapeFlipkart, scrapeCroma, scrapeMyntra, scrapeAjio, scrapeSnapdeal, scrapeNykaa, scrapeReliance, scrapeJioMart, scrapeMeesho } = require('./scrapers');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_PRO_API_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
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
app.use(express.json({ limit: '10mb' }));

// Helper function to timeout promises
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Scraping timeout')), ms))
  ]);
};

/**
 * Call Google Gemini Pro API
 * Supports gemini-1.5-pro with fallback to gemini-2.0-flash / gemini-1.5-flash
 * Supports multimodal image inputs and structured JSON response
 */
async function callGoogleGeminiPro({ prompt, file_urls, response_json_schema }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const models = ['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];
  let lastError = null;

  // Build request parts
  const parts = [];

  // Handle multimodal image inputs if provided
  if (Array.isArray(file_urls) && file_urls.length > 0) {
    for (const fileUrl of file_urls) {
      if (typeof fileUrl === 'string') {
        if (fileUrl.startsWith('data:')) {
          const match = fileUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            });
          }
        } else if (fileUrl.startsWith('http')) {
          try {
            const imgRes = await axios.get(fileUrl, { responseType: 'arraybuffer', timeout: 5000 });
            const mimeType = imgRes.headers['content-type'] || 'image/jpeg';
            const base64Data = Buffer.from(imgRes.data).toString('base64');
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data
              }
            });
          } catch (e) {
            console.warn('Could not fetch image URL for Gemini Pro:', e.message);
          }
        }
      }
    }
  }

  // Format prompt with strict JSON requirements
  const promptText = response_json_schema 
    ? `${prompt}\n\nIMPORTANT: You must respond ONLY with valid JSON strictly conforming to this schema, with no markdown code blocks or additional text:\n${JSON.stringify(response_json_schema, null, 2)}`
    : prompt;

  parts.push({ text: promptText });

  const requestBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      const candidate = response.data?.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error(`Empty response from model ${model}`);

      // Strip code fence if present
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      lastError = err;
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.warn(`Gemini model ${model} attempt failed: ${errorMsg}. Trying next model...`);
    }
  }

  throw lastError || new Error('All Google Gemini Pro model attempts failed');
}

app.get('/api/info', (req, res) => {
  res.json({
    name: 'PricePilot API',
    ai_provider: 'Google Gemini Pro API',
    gemini_configured: Boolean(GEMINI_API_KEY),
    platforms: ['amazon', 'flipkart', 'croma', 'myntra', 'ajio', 'snapdeal', 'nykaa', 'reliance_digital', 'jiomart', 'meesho']
  });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  const requestedPlatforms = req.query.platforms ? req.query.platforms.split(',') : null;
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const platformsToScrape = [
    { name: 'amazon', fn: () => scrapeAmazon(query) },
    { name: 'flipkart', fn: () => scrapeFlipkart(query) },
    { name: 'croma', fn: () => scrapeCroma(query) },
    { name: 'myntra', fn: () => scrapeMyntra(query) },
    { name: 'ajio', fn: () => scrapeAjio(query) },
    { name: 'snapdeal', fn: () => scrapeSnapdeal(query) },
    { name: 'nykaa', fn: () => scrapeNykaa(query) },
    { name: 'reliance_digital', fn: () => scrapeReliance(query) },
    { name: 'jiomart', fn: () => scrapeJioMart(query) },
    { name: 'meesho', fn: () => scrapeMeesho(query) },
  ].filter(p => !requestedPlatforms || requestedPlatforms.includes(p.name));

  const results = [];
  const timeoutMs = 8000;

  for (let i = 0; i < platformsToScrape.length; i += 2) {
    const chunk = platformsToScrape.slice(i, i + 2);
    const chunkPromises = chunk.map(p => withTimeout(p.fn(), timeoutMs));
    const chunkResults = await Promise.allSettled(chunkPromises);

    chunkResults.forEach((result, idx) => {
      const pName = chunk[idx].name;
      if (result.status === 'fulfilled') {
        const platformItems = result.value || [];
        results.push(...platformItems);
      } else {
        console.error(`${pName} scraping failed or timed out:`, result.reason);
      }
    });
  }

  res.json({ results });
});

app.post('/api/llm', async (req, res) => {
  try {
    const { prompt, file_urls, response_json_schema } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // 1. Google Gemini Pro API (Primary AI engine)
    if (GEMINI_API_KEY) {
      try {
        const geminiResult = await callGoogleGeminiPro({ prompt, file_urls, response_json_schema });
        return res.json(geminiResult);
      } catch (geminiError) {
        console.error("Google Gemini Pro API error:", geminiError.message);
      }
    }

    // 2. OpenAI Fallback if available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const fullPrompt = `${prompt}\n\nYou MUST respond in valid JSON matching this schema:\n${JSON.stringify(response_json_schema)}`;
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: fullPrompt }],
          response_format: { type: "json_object" },
        });
        return res.json(JSON.parse(completion.choices[0].message.content));
      } catch (openAiError) {
        console.error("OpenAI fallback error:", openAiError.message);
      }
    }

    res.status(503).json({
      error: 'Google Gemini Pro API key is required. Please set GEMINI_API_KEY in backend/.env'
    });
  } catch (error) {
    console.error("LLM endpoint error:", error);
    res.status(500).json({ error: 'Failed to process LLM request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`AI Engine: Google Gemini Pro API (${GEMINI_API_KEY ? 'Configured' : 'Key missing in .env'})`);
});
