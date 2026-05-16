import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Clock } from 'lucide-react';
import { PLATFORMS } from '@/lib/platforms';

export default function LoadingProgress({ platformStatuses }) {
  const doneCount = PLATFORMS.filter(p => platformStatuses[p.id] === 'done').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto mt-10">
      <div className="bg-card rounded-2xl border border-border/50 shadow-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-semibold text-foreground">Scanning platforms...</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{doneCount}/{PLATFORMS.length} done</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(doneCount / PLATFORMS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="space-y-2">
          {PLATFORMS.map((platform, index) => {
            const status = platformStatuses[platform.id] || 'waiting';
            const count = platformStatuses[platform.id + '_count'];
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                  status === 'done' ? 'bg-accent/8' :
                  status === 'searching' ? 'bg-primary/5' : 'bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform.color }} />
                  <span className={`text-sm font-medium ${status === 'waiting' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {platform.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'done' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                      {count !== undefined && <span className="text-xs text-muted-foreground">{count} found</span>}
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                    </motion.div>
                  )}
                  {status === 'searching' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                  {status === 'waiting' && <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}