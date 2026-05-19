import { base44 } from '@/api/base44Client';
import { PLATFORMS } from './platforms';

// Step 1: Use AI to identify the product from any input type
export async function identifyProduct(query, inputType, fileUrl) {
  let prompt = '';
  let file_urls = undefined;

  if (inputType === 'image' && fileUrl) {
    prompt = `You are a product intelligence assistant. Look at this product image carefully and extract structured product information. Identify the brand, model, color, category, and any visible specs. Generate 5 different search queries optimized for Indian e-commerce platforms like Amazon India, Flipkart, Myntra. Include an estimated price range in INR.`;
    file_urls = [fileUrl];
  } else if (inputType === 'url') {
    prompt = `You are a product intelligence assistant. The user provided this product URL: "${query}". Based on the URL and product identifiers in it, extract what product this likely is. Generate 5 search queries optimized for Indian e-commerce platforms.`;
  } else {
    prompt = `You are a product intelligence assistant. The user is searching for: "${query}". Extract structured product information and generate 5 search queries optimized for Indian e-commerce platforms like Amazon India, Flipkart, Myntra, Meesho, Ajio. Be specific about model numbers and variants.`;
  }

  try {
    return await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls,
      response_json_schema: {
        type: "object",
        properties: {
          brand: { type: "string" },
          productName: { type: "string" },
          model: { type: "string" },
          category: { type: "string" },
          color: { type: "string" },
          size: { type: "string" },
          keySpecs: { type: "array", items: { type: "string" } },
          searchQueries: { type: "array", items: { type: "string" } },
          alternativeTerms: { type: "array", items: { type: "string" } },
          confidence: { type: "number" },
          estimatedPriceRange: { type: "string" }
        }
      }
    });
  } catch (error) {
    console.warn("AI Identify Product failed, using fallback mock data.");
    const fallbackQuery = query || "iPhone 15";
    const lowerQuery = fallbackQuery.toLowerCase();
    const firstWord = fallbackQuery.split(' ')[0];
    const brand = ['iphone', 'macbook', 'apple'].includes(firstWord.toLowerCase()) ? "Apple" : 
                  ['samsung', 'galaxy'].includes(firstWord.toLowerCase()) ? "Samsung" :
                  firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    
    let category = "Electronics";
    if (lowerQuery.includes('shoe') || lowerQuery.includes('shirt') || lowerQuery.includes('nike') || lowerQuery.includes('adidas') || lowerQuery.includes('puma') || lowerQuery.includes('jeans')) {
      category = "Fashion";
    } else if (lowerQuery.includes('sofa') || lowerQuery.includes('bed') || lowerQuery.includes('table')) {
      category = "Home";
    } else if (lowerQuery.includes('makeup') || lowerQuery.includes('lipstick') || lowerQuery.includes('cream')) {
      category = "Beauty";
    }
                  
    return {
      brand: brand,
      productName: fallbackQuery.replace(new RegExp(`^${firstWord}\\s*`, 'i'), ''),
      category: category,
      searchQueries: [fallbackQuery],
      estimatedPriceRange: "₹5,000 - ₹15,000"
    };
  }
}

export async function searchAllPlatforms(productInfo, userQuery, onPlatformUpdate) {
  const allResults = [];
  
  const productCategory = (productInfo.category || 'all').toLowerCase();
  
  const searchQuery = userQuery || `${productInfo.brand || ''} ${productInfo.productName || ''}`.trim() || 'product';
  const queryLower = searchQuery.toLowerCase();
  
  const cheapKeywords = ['cheap', 'low', 'affordable', 'budget', 'unbranded', 'local', 'first copy', 'duplicate', 'fake'];
  const isCheapSearch = cheapKeywords.some(keyword => queryLower.includes(keyword));

  // Define platforms that we actually scrape (Avoid Meesho and Snapdeal for premium/normal searches)
  let scrapedPlatforms = ['amazon', 'flipkart', 'croma', 'myntra', 'ajio', 'nykaa', 'reliance_digital', 'jiomart'];
  if (isCheapSearch) {
    scrapedPlatforms.push('meesho');
    scrapedPlatforms.push('snapdeal');
  }
  
  const relevantPlatforms = PLATFORMS.filter(platform => {
    if (!platform.categories || platform.categories.includes('all')) return true;
    return platform.categories.some(cat => 
      productCategory.includes(cat) || cat.includes(productCategory)
    );
  });

  // Mark all relevant scraped platforms as 'searching'
  relevantPlatforms.filter(p => scrapedPlatforms.includes(p.id)).forEach(p => {
    if (onPlatformUpdate) onPlatformUpdate(p.id, 'searching');
  });

  // Call the live backend scraper API
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}&platforms=${scrapedPlatforms.join(',')}`);
    if (!response.ok) throw new Error(`Backend API error: ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
       data.results.forEach(r => {
           // Skip platforms that we dynamically decided not to scrape (e.g., Meesho for non-budget searches)
           if (!scrapedPlatforms.includes(r.platform)) return;
           
           // Provide fallback images if scraper didn't find one
           if (!r.image_url) {
               r.image_url = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&sig=${r.platform}`;
           }
           allResults.push(r);
       });
    }
  } catch (error) {
    console.error("Live scraping failed, falling back to mock data", error);
  }

  // Mark scraped platforms as 'done'
  scrapedPlatforms.forEach(platformId => {
     const count = allResults.filter(r => r.platform === platformId).length;
     if (onPlatformUpdate && relevantPlatforms.some(p => p.id === platformId)) {
        onPlatformUpdate(platformId, 'done', count);
     }
  });

  // Mark non-scraped platforms as 'done' with 0 results
  PLATFORMS.filter(p => !scrapedPlatforms.includes(p.id)).forEach(p => {
    if (onPlatformUpdate) onPlatformUpdate(p.id, 'done', 0);
  });

  // We no longer generate mock data for non-scraped platforms
  // This ensures we only display real products that are actually available and have accurate live prices.

  // Intelligent brand and relevance sorting
  const validPrices = allResults.map(r => r.price).filter(p => p > 0).sort((a, b) => a - b);
  const medianPrice = validPrices.length > 0 ? validPrices[Math.floor(validPrices.length / 2)] : 0;
  
  const topBrands = ['apple', 'samsung', 'sony', 'nike', 'adidas', 'puma', 'lg', 'whirlpool', 'hp', 'dell', 'lenovo', 'asus', 'oneplus', 'xiaomi', 'boat', 'jbl', 'bose', 'philips', 'realme', 'vivo', 'oppo'];
  const pBrand = (productInfo.brand || '').toLowerCase();
  
  const negativeKeywords = ['case', 'cover', 'protector', 'glass', 'cable', 'charger', 'skin', 'guard', 'stand', 'strap', 'adapter', 'battery', 'replacement', 'refurbished', 'dummy', 'back panel', 'mount', 'holder', 'sleeve', 'bag'];

  allResults.forEach(r => {
    let score = 0;
    const title = (r.title || '').toLowerCase();
    
    // strict brand match logic
    if (pBrand && pBrand !== 'unbranded') {
      if (title.includes(pBrand)) {
        score += 200; // Big boost for branded exact matches
      } else {
        score -= 500; // Severe penalty if the requested brand is missing entirely
      }
    }
    
    // Strict model match logic (prevents Galaxy A17 from matching Galaxy S24)
    const genericWords = ['cheap', 'budget', 'local', 'shirt', 'shirts', 'shoe', 'shoes', 'phone', 'smartphone', 'laptop', 'tv', 'television', 'watch', 'smartwatch', 'clothes', 'wear', 'unbranded'];
    const modelTerms = (productInfo.productName || '').toLowerCase().split(' ').filter(w => w.length > 1 && !genericWords.includes(w) && !topBrands.includes(w));
    let missingModelTerms = 0;
    modelTerms.forEach(term => {
      // Remove punctuation to match properly
      const cleanTitle = title.replace(/[^a-z0-9 ]/g, '');
      const cleanTerm = term.replace(/[^a-z0-9 ]/g, '');
      if (cleanTerm && !cleanTitle.includes(cleanTerm)) {
        missingModelTerms++;
      }
    });
    
    if (missingModelTerms > 0 && modelTerms.length > 0) {
      score -= (missingModelTerms * 600); // Heavily penalize missing model terms
    } else if (modelTerms.length > 0) {
      score += 200; // Reward exact model match
    }
    
    // top brand match
    if (topBrands.some(b => title.includes(b))) score += 50;
    
    // penalize suspiciously low price (likely an accessory or fake)
    if (medianPrice > 1000 && r.price < medianPrice * 0.4) {
      if (!isCheapSearch) score -= 800; // Heavily penalize cheap alternatives if not looking for budget
    }

    // heavily penalize accessories if the user didn't explicitly search for them
    negativeKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (!queryLower.includes(word) && regex.test(title)) {
        score -= 2000;
      }
    });
    
    r.relevance_score = score;
    r.is_exact_match = score >= 0;
  });

  // Filter out definitely wrong items (like phone cases when searching for phones)
  const filteredResults = allResults.filter(r => r.relevance_score > -1000);

  // Sort by relevance score (descending), then by price (ascending)
  return filteredResults.sort((a, b) => {
    if (b.relevance_score !== a.relevance_score) {
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    }
    return (a.price || 0) - (b.price || 0);
  });
}

// Step 3: Get AI verdict/analysis on all results
export async function getAIVerdict(productInfo, results) {
  const topResults = results.slice(0, 12).map(r => ({
    platform: r.platform,
    title: r.title,
    price: r.price,
    mrp: r.mrp,
    discount_percent: r.discount_percent,
    rating: r.rating,
    is_exact_match: r.is_exact_match,
    in_stock: r.in_stock
  }));

  try {
    return await base44.integrations.Core.InvokeLLM({
      prompt: `You are a savvy Indian shopping assistant. Analyze these price comparison results for "${productInfo.brand || ''} ${productInfo.productName || ''}" and give your expert verdict.

Results:
${JSON.stringify(topResults, null, 2)}

Provide:
1. The best deal (platform name) and why — consider price, reliability, delivery
2. Average market price across all platforms
3. One-sentence verdict/recommendation for the buyer
4. Savings percentage at best price vs average
5. Any suspiciously low prices that might indicate fakes (array of platform IDs)
6. 3 alternative product suggestions at similar budget with reasoning and estimated prices
7. 3 smart buying tips for this product category`,
      response_json_schema: {
        type: "object",
        properties: {
          best_deal: { type: "string" },
          best_deal_reason: { type: "string" },
          average_price: { type: "number" },
          verdict: { type: "string" },
          savings_percent: { type: "number" },
          suspicious_results: { type: "array", items: { type: "string" } },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                reason: { type: "string" },
                estimated_price: { type: "string" }
              }
            }
          },
          buying_tips: { type: "array", items: { type: "string" } }
        }
      }
    });
  } catch (e) {
    console.warn("AI Verdict failed, using fallback mock data.");
    const exactMatches = topResults.filter(r => r.is_exact_match);
    const validResults = exactMatches.length > 0 ? exactMatches : topResults;
    
    const avgPrice = validResults.length > 0 ? Math.floor(validResults.reduce((sum, r) => sum + r.price, 0) / validResults.length) : 0;
    const bestDeal = validResults.length > 0 ? validResults.reduce((min, r) => r.price < min.price ? r : min, validResults[0]) : null;
    const bestDealPlatform = bestDeal ? bestDeal.platform.charAt(0).toUpperCase() + bestDeal.platform.slice(1) : "Amazon";
    
    return {
      best_deal: bestDealPlatform,
      best_deal_reason: `Offers the lowest price at ₹${bestDeal?.price?.toLocaleString('en-IN') || 0} for the exact product.`,
      average_price: avgPrice,
      verdict: `Buy from ${bestDealPlatform} for the best combination of price and reliability.`,
      savings_percent: bestDeal && bestDeal.mrp ? Math.floor(((bestDeal.mrp - bestDeal.price) / bestDeal.mrp) * 100) : 5,
      suspicious_results: [],
      alternatives: [
        { name: `Alternative ${productInfo.category || 'Product'}`, reason: "Similar quality and features", estimated_price: `~₹${avgPrice.toLocaleString('en-IN')}` }
      ],
      buying_tips: ["Check for bank offers to save extra", "Verify seller ratings"]
    };
  }
}