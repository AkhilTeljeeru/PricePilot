import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, BarChart3, Sparkles } from 'lucide-react';
import SearchBox from '@/components/search/SearchBox';
import LoadingProgress from '@/components/search/LoadingProgress';
import { identifyProduct, searchAllPlatforms, getAIVerdict } from '@/lib/searchService';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const features = [
  { icon: Zap, title: '10 Platforms', desc: 'Amazon, Flipkart, Myntra & 7 more at once' },
  { icon: Shield, title: 'AI-Powered', desc: 'Identify products from images, URLs or text' },
  { icon: Clock, title: 'Real-Time', desc: 'Live prices compared in seconds' },
  { icon: BarChart3, title: 'Price Alerts', desc: 'Track products and get notified on drops' },
];

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [platformStatuses, setPlatformStatuses] = useState({});

  const handleSearch = async (query, inputType, fileUrl) => {
    setIsLoading(true);
    setPlatformStatuses({});

    // 1. AI identifies the product
    try {
      const productInfo = await identifyProduct(query, inputType, fileUrl);

    // 2. Search all platforms with live progress updates
    const onPlatformUpdate = (platformId, status, count) => {
      setPlatformStatuses(prev => ({
        ...prev,
        [platformId]: status,
        ...(count !== undefined ? { [platformId + '_count']: count } : {})
      }));
    };

    const results = await searchAllPlatforms(productInfo, query, onPlatformUpdate);

    // 3. Get AI verdict
    const verdict = await getAIVerdict(productInfo, results);

    // 4. Persist to history
    let searchRecord;
    try {
      searchRecord = await base44.entities.SearchHistory.create({
        query,
        input_type: inputType,
        product_name: `${productInfo.brand || ''} ${productInfo.productName || ''}`.trim() || query,
        brand: productInfo.brand || '',
        category: productInfo.category || '',
        image_url: fileUrl || results[0]?.image_url || '',
        results,
        ai_verdict: verdict,
        share_id: Math.random().toString(36).substring(2, 10),
      });
    } catch (e) {
      console.warn("DB Create failed, generating mock record ID.");
      const mockId = Math.random().toString(36).substring(2, 10);
      searchRecord = { id: mockId };
      
      localStorage.setItem(`mock_search_${mockId}`, JSON.stringify({
        query,
        input_type: inputType,
        product_name: `${productInfo.brand || ''} ${productInfo.productName || ''}`.trim() || query,
        brand: productInfo.brand || '',
        category: productInfo.category || '',
        image_url: fileUrl || results[0]?.image_url || '',
        results,
        ai_verdict: verdict
      }));
    }

    navigate(`/results/${searchRecord.id}`);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(error.message || "Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AI-Powered Price Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
              Find the <span className="text-primary">best price</span><br />
              across <span className="text-accent">10 platforms</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Paste a product image, URL, or type what you're looking for.
              PricePilot scans Amazon, Flipkart, Myntra and 7 more in seconds.
            </p>
          </motion.div>

          <SearchBox onSearch={handleSearch} isLoading={isLoading} />

          {isLoading && <LoadingProgress platformStatuses={platformStatuses} />}
        </div>
      </section>

      {/* Feature cards */}
      {!isLoading && (
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-card rounded-xl border border-border/50 p-5 hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}