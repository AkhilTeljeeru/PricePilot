import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, AlertTriangle, Lightbulb, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AIVerdictCard({ verdict }) {
  if (!verdict) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-gradient-to-br from-primary/5 via-card to-chart-4/5 border border-primary/20 shadow-lg"
    >
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground">AI Verdict</h3>
        </div>

        <p className="text-base font-medium text-foreground mb-4 leading-relaxed">{verdict.verdict}</p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {verdict.average_price > 0 && (
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">Avg. Market Price</p>
              <p className="text-lg font-bold text-foreground">₹{verdict.average_price?.toLocaleString('en-IN')}</p>
            </div>
          )}
          {verdict.savings_percent > 0 && (
            <div className="bg-accent/10 rounded-xl p-3">
              <p className="text-xs text-muted-foreground mb-1">You Save</p>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-accent" />
                <p className="text-lg font-bold text-accent">{verdict.savings_percent}%</p>
              </div>
            </div>
          )}
        </div>

        {verdict.suspicious_results?.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">Price Alert</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unusually low prices on: {verdict.suspicious_results.join(', ')}. Verify seller before purchasing.
            </p>
          </div>
        )}

        {verdict.buying_tips?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-chart-3" />
              <span className="text-xs font-semibold text-foreground">Buying Tips</span>
            </div>
            <div className="space-y-1.5">
              {verdict.buying_tips.slice(0, 3).map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-chart-3 mt-0.5">•</span>{tip}
                </p>
              ))}
            </div>
          </div>
        )}

        {verdict.alternatives?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Alternatives to Consider</span>
            </div>
            <div className="space-y-2">
              {verdict.alternatives.map((alt, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                  <Badge variant="outline" className="text-[10px] mt-0.5 flex-shrink-0">{i + 1}</Badge>
                  <div>
                    <p className="text-xs font-medium text-foreground">{alt.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{alt.reason}</p>
                    {alt.estimated_price && (
                      <p className="text-[11px] text-primary font-medium mt-0.5">~{alt.estimated_price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}