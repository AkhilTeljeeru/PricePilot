import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Search, ArrowRight, Loader2, Image, Link2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const inputTypeIcons = { text: Type, url: Link2, image: Image };

export default function History() {
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => base44.entities.SearchHistory.list('-created_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SearchHistory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
      toast.success('Search removed');
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search History</h1>
          <p className="text-sm text-muted-foreground">{searches.length} searches</p>
        </div>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <HistoryIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No searches yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">Your search history will appear here.</p>
          <Link to="/"><Button className="gap-2"><Search className="w-4 h-4" />Start Searching</Button></Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {searches.map((search, index) => {
              const InputIcon = inputTypeIcons[search.input_type] || Type;
              const resultCount = search.results?.length || 0;
              const bestPrice = search.results?.length
                ? Math.min(...search.results.map(r => r.price || Infinity))
                : null;

              return (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/results/${search.id}`}
                    className="block bg-card rounded-xl border border-border/50 p-4 hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <InputIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {search.product_name || search.query}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {search.created_date ? format(new Date(search.created_date), 'MMM d, yyyy · h:mm a') : ''}
                          </span>
                          <span className="text-xs text-muted-foreground">· {resultCount} results</span>
                          {bestPrice && bestPrice < Infinity && (
                            <span className="text-xs font-semibold text-accent">
                              Best: ₹{bestPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate(search.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}