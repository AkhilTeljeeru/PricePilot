import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Share2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import BestDealCard from '@/components/result/BestDealCard';
import ProductCard from '@/components/result/ProductCard';
import FilterBar from '@/components/result/FilterBar';
import AIVerdictCard from '@/components/result/AIVerdictCard';
import PriceHistoryChart from '@/components/result/PriceHistoryChart';
import WatchlistButton from '@/components/result/WatchlistButton';

export default function Results() {
  const { id } = useParams();
  const [sort, setSort] = useState('relevance');
  const [showExactOnly, setShowExactOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: search, isLoading } = useQuery({
    queryKey: ['search', id],
    queryFn: async () => {
      try {
        const results = await base44.entities.SearchHistory.filter({ id });
        if (results && results.length > 0) return results[0];
      } catch (e) {
        console.warn("DB read failed, falling back to mock data");
      }
      
      const mockData = localStorage.getItem(`mock_search_${id}`);
      if (mockData) {
        return JSON.parse(mockData);
      }
      return null;
    },
  });

  const results = search?.results || [];
  const aiVerdict = search?.ai_verdict;

  const filteredResults = useMemo(() => {
    let filtered = showExactOnly ? results.filter(r => r.is_exact_match) : results;
    switch (sort) {
      case 'price_asc': return [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc': return [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'discount': return [...filtered].sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
      case 'rating': return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'relevance': return filtered;
      default: return filtered;
    }
  }, [results, sort, showExactOnly]);

  const bestDeal = results.length > 0 ? results[0] : null;

  const suspiciousPlatforms = aiVerdict?.suspicious_results || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-muted-foreground mb-4">Search not found</p>
        <Link to="/"><Button variant="outline">Back to search</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {search.product_name || search.query}
            </h1>
            {(search.brand || search.category) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[search.brand, search.category].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </Button>
          <WatchlistButton search={search} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main results column */}
        <div className="lg:col-span-2 space-y-6">
          {bestDeal && <BestDealCard result={bestDeal} aiVerdict={aiVerdict} />}

          <FilterBar
            sort={sort}
            onSortChange={setSort}
            showExactOnly={showExactOnly}
            onExactOnlyChange={setShowExactOnly}
            resultCount={filteredResults.length}
          />

          <div className="space-y-3">
            {filteredResults
              .filter((_, i) => !(i === 0 && sort === 'price_asc')) // skip best deal (already shown above)
              .map((result, index) => (
                <ProductCard
                  key={`${result.platform}-${index}`}
                  result={result}
                  index={index}
                  isSuspicious={suspiciousPlatforms.some(s =>
                    s.toLowerCase().includes(result.platform?.toLowerCase())
                  )}
                />
              ))}
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No results match your filters.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AIVerdictCard verdict={aiVerdict} />
          {bestDeal && <PriceHistoryChart currentPrice={bestDeal.price} />}
        </div>
      </div>
    </div>
  );
}