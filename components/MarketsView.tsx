'use client';

import React, { useState } from 'react';
import { PredictionCard } from '@/components/PredictionCard';
import { Search, Bell, Palette } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { MOCK_MARKETS } from '@/lib/mockData';

const CATEGORIES = ['New', 'All', 'Crypto', 'Politics', 'Sports', 'Pop Culture'];
const TIME_FILTERS = ['5 Min', '15 Min', '1 Hour', '1 Day'];

export function MarketsView() {
  const [activeCategory, setActiveCategory] = useState('Crypto');
  const [activeTime, setActiveTime] = useState('5 Min');
  const { toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="pt-12 pb-0 px-5 z-50 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-full glass-panel text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              <Search size={18} />
            </button>
            <button className="p-2.5 rounded-full glass-panel text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              <Bell size={18} />
            </button>
            <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent-1)] to-[var(--color-accent-2)] opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative whitespace-nowrap pb-4 text-sm font-bold transition-colors ${
                activeCategory === cat 
                  ? 'text-[var(--color-text-primary)]' 
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]/70'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-2)] shadow-[0_0_8px_var(--color-accent-2)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Sub Filters */}
      {activeCategory === 'Crypto' && (
        <div className="px-5 py-4 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          {TIME_FILTERS.map(time => (
            <button
              key={time}
              onClick={() => setActiveTime(time)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeTime === time 
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-md' 
                  : 'glass-panel text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 no-scrollbar">
        {MOCK_MARKETS.map(market => (
          <PredictionCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
