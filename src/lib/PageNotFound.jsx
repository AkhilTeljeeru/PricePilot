import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
        <Zap className="w-8 h-8 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-8 text-center">This page doesn't exist. Let's get you back on track.</p>
      <Link to="/">
        <Button className="gap-2">
          <Home className="w-4 h-4" />
          Back to PricePilot
        </Button>
      </Link>
    </div>
  );
}