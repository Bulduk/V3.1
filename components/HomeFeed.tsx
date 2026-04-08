'use client';

import React from 'react';
import { PredictionCard } from '@/components/PredictionCard';
import { Sparkles } from 'lucide-react';
import { MOCK_MARKETS } from '@/lib/mockData';

export function HomeFeed() {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 no-scrollbar">
      <header className="pt-12 pb-4 px-5 z-50 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Predix Feed</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Smart, real-time, algorithm-driven.</p>
      </header>

      <div className="px-5 py-2">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[var(--color-accent-2)]" />
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Discovery</h2>
        </div>
        {MOCK_MARKETS.map(market => (
          <PredictionCard key={`feed-${market.id}`} market={market} />
        ))}
      </div>
    </div>
  );
}
