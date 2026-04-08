'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Leaf, Palette } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface DashboardProps {
  totalValue: number;
  impactScore: number;
  impactTokens: number;
}

export function Dashboard({ totalValue, impactScore, impactTokens }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-start pointer-events-none"
    >
      {/* Left: Total Value */}
      <div className="glass-panel rounded-2xl p-4 pointer-events-auto flex flex-col gap-2">
        <div>
          <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-wider mb-1">TOTAL VALUE</p>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors w-fit"
        >
          <Palette size={12} />
          <span className="uppercase">{theme} THEME</span>
        </button>
      </div>

      {/* Right: Impact & Wallet */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col items-end pointer-events-auto">
        <div className="flex items-center gap-2 mb-1">
          <Leaf className="text-[var(--color-accent-2)]" size={12} />
          <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-wider">IMPACT SCORE</p>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-accent-2)]">
          {impactScore.toLocaleString('en-US')}
        </h2>
        <div className="flex items-center gap-1 mt-2 bg-black/10 px-2 py-1 rounded-md">
          <Wallet className="text-[var(--color-accent-1)]" size={10} />
          <span className="text-[10px] font-mono font-bold text-[var(--color-accent-1)]">
            {impactTokens.toFixed(2)} $IMPACT
          </span>
        </div>
      </div>
    </motion.div>
  );
}
