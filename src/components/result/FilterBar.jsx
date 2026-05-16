import React from 'react';
import { ArrowUpDown, IndianRupee, Percent, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Best Match', icon: Star },
  { id: 'price_asc', label: 'Price ↑', icon: IndianRupee },
  { id: 'price_desc', label: 'Price ↓', icon: IndianRupee },
  { id: 'discount', label: 'Discount', icon: Percent },
  { id: 'rating', label: 'Rating', icon: Star },
];

export default function FilterBar({ sort, onSortChange, showExactOnly, onExactOnlyChange, resultCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{resultCount} results</span>
        <Button
          variant={showExactOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onExactOnlyChange(!showExactOnly)}
          className={`text-xs h-7 ${showExactOnly ? 'bg-primary text-primary-foreground' : ''}`}
        >
          Exact only
        </Button>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {SORT_OPTIONS.map(option => (
          <Button
            key={option.id}
            variant={sort === option.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSortChange(option.id)}
            className={`text-xs h-7 flex-shrink-0 gap-1 ${sort === option.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <option.icon className="w-3 h-3" />{option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}