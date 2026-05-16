PricePilot 🛒⚡

AI-Powered Multi E-Commerce Price Comparison & Product Discovery Platform

🚀 Overview

PricePilot is a full-stack AI-powered web application that helps users instantly compare product prices, discounts, offers, and availability across multiple e-commerce platforms from one centralized dashboard.

Users can:

Upload a product image
Paste a product URL
Enter product name/specifications manually

PricePilot uses AI + parallel multi-site search to identify the same or similar products across platforms like Amazon India, Flipkart, Myntra, Meesho, Ajio, Nykaa, Croma, Snapdeal, Reliance Digital, and JioMart.

The platform saves users time, helps them find the best deals, and provides intelligent shopping recommendations.

✨ Features
🔍 Smart Product Search
Supports 3 input methods:
📷 Upload product image
🔗 Paste product URL
⌨️ Manual product search
🤖 AI Product Intelligence

Powered by Claude API:

Product extraction from image/text
Brand & model detection
Smart search query generation
Similar product matching
AI recommendations
Fake deal detection
🌐 Multi-Site Parallel Search

Searches multiple platforms simultaneously:

Amazon India
Flipkart
Myntra
Meesho
Ajio
Snapdeal
Nykaa
Croma
Reliance Digital
JioMart

Extracts:

Price
MRP
Discount %
Availability
Delivery info
Ratings
Offers
📊 Intelligent Results Dashboard
Best Deal Highlight
Cheapest-first sorting
AI Verdict Card
Price comparison cards
Similar product recommendations
Better alternatives within budget
❤️ User Features
Watchlist
Price drop alerts
Shareable comparison links
Price history charts
⚡ Real-Time Search Experience

Animated live progress:

Checking Amazon India... ✓
Scanning Flipkart... ✓
Searching Myntra... ⏳
🏗️ System Architecture
                ┌───────────────────┐
                │    React Client   │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Express API Layer │
                └─────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
 ┌────────────┐   ┌──────────────┐   ┌─────────────┐
 │ Claude API │   │ Scraper Pool │   │ PostgreSQL  │
 └────────────┘   └──────────────┘   └─────────────┘
                          │
                ┌───────────────────┐
                │      Redis        │
                └───────────────────┘
🛠️ Tech Stack
Frontend
React 18
Vite
Tailwind CSS
shadcn/ui
Zustand
Backend
Node.js
Express.js
TypeScript
AI
Claude API
Claude Vision
Database
PostgreSQL
Redis
Scraping & Automation
Playwright
BeautifulSoup
BullMQ
Authentication
JWT
Google OAuth
📂 Folder Structure
PricePilot/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── services/
│
├── server/
│   ├── src/
│   │   ├── scrapers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── queue/
│   │   └── utils/
│
├── docker-compose.yml
├── README.md
└── package.json
🧠 AI Workflow
Image Search Pipeline
User uploads image
Image compressed on client side
Sent to Claude Vision
AI extracts:
Brand
Model
Category
Color
Key specs
System generates optimized search queries
Parallel platform search starts
Results merged + ranked
🔄 Search Aggregation Engine

PricePilot intelligently:

Merges results from all platforms
Detects duplicate products
Calculates similarity scores
Identifies exact matches
Ranks best deals
