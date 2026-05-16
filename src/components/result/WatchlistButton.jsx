import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WatchlistButton({ search }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const bestResult = search.results?.sort((a, b) => (a.price || 0) - (b.price || 0))[0];
    const itemData = {
      query: search.query,
      product_name: search.product_name || search.query,
      brand: search.brand || '',
      image_url: search.image_url || bestResult?.image_url || '',
      current_best_price: bestResult?.price || 0,
      best_platform: bestResult?.platform || '',
      search_id: search.id,
      alert_enabled: false,
      price_history: [{ date: new Date().toISOString(), price: bestResult?.price || 0, platform: bestResult?.platform || '' }]
    };
    
    try {
      await base44.entities.WatchlistItem.create(itemData);
    } catch (error) {
      console.warn("DB Create failed, saving to local storage.");
      const mockWatchlist = JSON.parse(localStorage.getItem('mock_watchlist') || '[]');
      mockWatchlist.push({ ...itemData, id: Math.random().toString(36).substring(2, 10), created_date: new Date().toISOString() });
      localStorage.setItem('mock_watchlist', JSON.stringify(mockWatchlist));
    }
    
    setSaving(false);
    setSaved(true);
    toast.success('Added to your watchlist');
  };

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={handleSave}
      disabled={saving || saved}
      className={`gap-2 ${saved ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15' : ''}`}
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${saved ? 'fill-destructive' : ''}`} />}
      {saved ? 'Saved' : 'Watchlist'}
    </Button>
  );
}