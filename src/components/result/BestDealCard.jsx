import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ExternalLink, TrendingDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPlatform } from '@/lib/platforms';

export default function BestDealCard({ result, aiVerdict }) {
  if (!result) return null;
  const platform = getPlatform(result.platform);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-card to-accent/5 border-2 border-accent/30 shadow-xl"
    >
      <div className="absolute top-0 right-0">
        <div className="bg-accent text-accent-foreground px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5 shadow-lg">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Best Deal</span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md"
            style={{ backgroundColor: platform.color + '18', border: `2px solid ${platform.color}35` }}
          >
            {platform.logo ? (
              <img
                src={platform.logo}
                alt={platform.name}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded"
              />
            ) : (
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: platform.color }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
              <span className="text-sm font-semibold" style={{ color: platform.color }}>{platform.name}</span>
              {result.is_exact_match && (
                <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                  <Shield className="w-3 h-3 mr-1" />Exact Match
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-3">{result.title}</h3>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-extrabold text-accent">
                ₹{result.price?.toLocaleString('en-IN')}
              </span>
              {result.mrp && result.mrp > result.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{result.mrp?.toLocaleString('en-IN')}
                </span>
              )}
              {result.discount_percent > 0 && (
                <Badge className="bg-accent/20 text-accent border-0 font-bold">
                  <TrendingDown className="w-3 h-3 mr-1" />{result.discount_percent}% OFF
                </Badge>
              )}
            </div>

            {result.delivery_info && (
              <p className="text-sm text-muted-foreground mb-3">{result.delivery_info}</p>
            )}

            {aiVerdict?.best_deal_reason && (
              <p className="text-sm text-accent font-medium italic mb-4">"{aiVerdict.best_deal_reason}"</p>
            )}

            <Button
              onClick={() => window.open(result.url, '_blank')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg shadow-accent/25"
            >
              View Deal <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}