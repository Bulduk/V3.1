'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PredictionMarket } from '@/lib/mockData';
import { CircularScore } from './CircularScore';
import { TrendingUp, TrendingDown, Minus, Users, MessageCircle } from 'lucide-react';

export function PredictionCard({ market }: { market: PredictionMarket }) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/market/${market.id}`)}
      className="glass-panel rounded-3xl p-4 mb-6 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Top: Thumbnail & Title & Score */}
      <div className="flex gap-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--color-border)]">
          <Image src={market.imageUrl} alt={market.title} fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 flex flex-col justify-between py-1">
          <h3 className="text-base font-bold leading-tight text-[var(--color-text-primary)] line-clamp-3">
            {market.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">{market.volume} Vol</span>
            {market.isLive && <span className="text-[10px] font-bold text-[var(--color-accent-red)] bg-[var(--color-accent-red)]/10 px-1.5 py-0.5 rounded">LIVE</span>}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <CircularScore score={market.stats.score} size={50} strokeWidth={4} />
          <span className="text-[8px] text-[var(--color-text-secondary)] uppercase mt-1 font-bold tracking-wider">AI Score</span>
        </div>
      </div>

      {/* Middle: Probability Bar (If BINARY) */}
      {market.model === 'BINARY' && (
        <div className="w-full">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-[var(--color-accent-2)]">YES {market.probability}%</span>
            <span className="text-[var(--color-accent-red)]">NO {100 - market.probability}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-black/40 rounded-full overflow-hidden flex">
            <div className="h-full bg-[var(--color-accent-2)]" style={{ width: `${market.probability}%` }} />
            <div className="h-full bg-[var(--color-accent-red)]" style={{ width: `${100 - market.probability}%` }} />
          </div>
        </div>
      )}

      {/* Bottom: Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-1.5">
          {market.stats.trend === 'up' && <TrendingUp size={14} className="text-[var(--color-accent-2)]" />}
          {market.stats.trend === 'down' && <TrendingDown size={14} className="text-[var(--color-accent-red)]" />}
          {market.stats.trend === 'stable' && <Minus size={14} className="text-[var(--color-text-secondary)]" />}
          <span className={`text-xs font-bold ${market.stats.trend === 'up' ? 'text-[var(--color-accent-2)]' : market.stats.trend === 'down' ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-text-secondary)]'}`}>
            {market.stats.growth > 0 ? '+' : ''}{market.stats.growth}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Users size={14} />
            <span className="text-xs font-bold">{market.stats.reach}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <MessageCircle size={14} />
            <span className="text-xs font-bold">{market.stats.engagement}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
