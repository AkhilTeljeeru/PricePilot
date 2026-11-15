import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import GoogleGeminiLogo from '@/components/ui/GoogleGeminiLogo';

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
        <div className="flex items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <GoogleGeminiLogo className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">AI Verdict</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 text-xs font-semibold">
            <GoogleGeminiLogo className="w-3.5 h-3.5" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Google Gemini Pro
            </span>
          </div>
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
            <ul className="space-y-1.5">
              {verdict.buying_tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verdict.alternatives?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2">Alternative Suggestions</h4>
            <div className="space-y-2">
              {verdict.alternatives.map((alt, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-foreground">{alt.name}</span>
                    <span className="text-xs font-bold text-primary">{alt.estimated_price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
