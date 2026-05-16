import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Star, Truck, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPlatform } from '@/lib/platforms';

export default function ProductCard({ result, index, isSuspicious }) {
  const platform = getPlatform(result.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`group bg-card rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isSuspicious ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 hover:border-primary/20'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: platform.color + '15', border: `1.5px solid ${platform.color}30` }}
          >
            {platform.logo ? (
              <img
                src={platform.logo}
                alt={platform.name}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded"
              />
            ) : (
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: platform.color }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: platform.color }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: platform.color }}>
                {platform.name}
              </span>
              {result.is_exact_match && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-accent/30 text-accent">
                  <Shield className="w-2.5 h-2.5 mr-0.5" /> Match
                </Badge>
              )}
              {isSuspicious && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">
                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Verify
                </Badge>
              )}
            </div>

            <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{result.title}</h4>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-xl font-extrabold text-foreground">
                ₹{result.price?.toLocaleString('en-IN')}
              </span>
              {result.mrp && result.mrp > result.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{result.mrp?.toLocaleString('en-IN')}
                </span>
              )}
              {result.discount_percent > 0 && (
                <Badge className="bg-accent/15 text-accent border-0 text-xs font-bold">
                  {result.discount_percent}% off
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {result.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-chart-3 text-chart-3" />
                  <span>{result.rating}</span>
                  {result.rating_count > 0 && <span>({result.rating_count?.toLocaleString()})</span>}
                </div>
              )}
              {result.delivery_info && (
                <div className="flex items-center gap-1">
                  <Truck className="w-3 h-3" /><span>{result.delivery_info}</span>
                </div>
              )}
              {result.seller && <span>Sold by {result.seller}</span>}
            </div>

            {result.offers?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {result.offers.slice(0, 2).map((offer, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {offer}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-end justify-center flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(result.url, '_blank')}
              className="gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
            >
              View <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="sm:hidden mt-3">
          <Button size="sm" variant="outline" onClick={() => window.open(result.url, '_blank')} className="w-full gap-1.5">
            View on {platform.name} <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}