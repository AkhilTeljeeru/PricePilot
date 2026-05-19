import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Bell, BellOff, ExternalLink, Loader2, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlatform } from '@/lib/platforms';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Watchlist() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      try {
        const result = await base44.entities.WatchlistItem.list('-created_date');
        if (result && result.length > 0) return result;
      } catch (e) {
        console.warn("DB read failed, falling back to local storage");
      }
      return JSON.parse(localStorage.getItem('mock_watchlist') || '[]').sort((a, b) => 
        new Date(b.created_date || 0) - new Date(a.created_date || 0)
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      try {
        await base44.entities.WatchlistItem.delete(id);
      } catch (e) {
        let mockWatchlist = JSON.parse(localStorage.getItem('mock_watchlist') || '[]');
        mockWatchlist = mockWatchlist.filter(item => item.id !== id);
        localStorage.setItem('mock_watchlist', JSON.stringify(mockWatchlist));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, enabled, targetPrice }) => {
      try {
        await base44.entities.WatchlistItem.update(id, { alert_enabled: enabled, target_price: targetPrice });
      } catch (e) {
        let mockWatchlist = JSON.parse(localStorage.getItem('mock_watchlist') || '[]');
        mockWatchlist = mockWatchlist.map(item => 
          item.id === id ? { ...item, alert_enabled: enabled, target_price: targetPrice } : item
        );
        localStorage.setItem('mock_watchlist', JSON.stringify(mockWatchlist));
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshPrices = async () => {
    setIsRefreshing(true);
    let updatedCount = 0;
    try {
      for (const item of items) {
        // Use the exact original query to fetch live prices consistently
        const searchQuery = item.query || item.product_name;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const bestDeal = data.results[0];
            try {
              await base44.entities.WatchlistItem.update(item.id, {
                current_best_price: bestDeal.price,
                best_platform: bestDeal.platform
              });
            } catch (e) {
              let mockWatchlist = JSON.parse(localStorage.getItem('mock_watchlist') || '[]');
              mockWatchlist = mockWatchlist.map(wItem => 
                wItem.id === item.id ? { ...wItem, current_best_price: bestDeal.price, best_platform: bestDeal.platform } : wItem
              );
              localStorage.setItem('mock_watchlist', JSON.stringify(mockWatchlist));
            }
            updatedCount++;
            
            // Check if alert should trigger
            if (item.alert_enabled && bestDeal.price <= item.target_price) {
              toast.success(`Price Drop Alert! ${item.product_name} is now ₹${bestDeal.price.toLocaleString('en-IN')}`, {
                duration: 6000,
              });
            }
          }
        }
      }
      if (updatedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        toast.success(`Refreshed prices for ${updatedCount} items!`);
      } else {
        toast.info("Prices are already up to date.");
      }
    } catch (e) {
      toast.error("Failed to refresh some prices");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground">{items.length} products tracked</p>
        </div>
        {items.length > 0 && (
          <div className="ml-auto">
            <Button onClick={refreshPrices} disabled={isRefreshing} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No saved products yet</h2>
          <p className="text-muted-foreground mb-6 text-sm">Search for a product and save it to track prices.</p>
          <Link to="/"><Button className="gap-2"><Search className="w-4 h-4" />Start Searching</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item, index) => {
              const platform = getPlatform(item.best_platform);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border border-border/50 p-4 sm:p-5 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{item.product_name}</h3>
                          {item.brand && <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>}
                        </div>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg font-bold text-foreground">
                          ₹{item.current_best_price?.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }} />
                          <span className="text-xs text-muted-foreground">{platform.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline" size="sm"
                          className={`h-7 text-xs gap-1.5 ${item.alert_enabled ? 'bg-chart-3/15 text-chart-3 border-chart-3/20' : ''}`}
                          onClick={() => toggleAlertMutation.mutate({
                            id: item.id,
                            enabled: !item.alert_enabled,
                            targetPrice: item.target_price || Math.round((item.current_best_price || 0) * 0.9)
                          })}
                        >
                          {item.alert_enabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                          {item.alert_enabled ? `Alert: ₹${item.target_price?.toLocaleString('en-IN')}` : 'Set Alert'}
                        </Button>
                        {item.search_id && (
                          <Link to={`/results/${item.search_id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                              View Results <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}