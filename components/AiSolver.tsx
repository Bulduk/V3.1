'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X } from 'lucide-react';

interface AiSolverProps {
  onIntentSubmit: (intent: string, result: any) => void;
}

export function AiSolver({ onIntentSubmit }: AiSolverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeIntent = (userIntent: string) => {
    const lower = userIntent.toLowerCase();
    if (lower.includes('tesla')) {
      return {
        title: 'Tesla (TSLA)',
        type: 'Stock',
        description: 'AI Identified: Stock (RWA). High liquidity, sustainable energy impact.',
        impactScore: 78,
        estReturn: '+12.4%',
        imageUrl: 'https://picsum.photos/seed/tesla/800/1600'
      };
    } else if (lower.includes('bitcoin') || lower.includes('btc')) {
      return {
        title: 'Bitcoin (BTC)',
        type: 'Crypto',
        description: 'AI Identified: Crypto. Routed via Green Mining Pools.',
        impactScore: 45,
        estReturn: '+8.2%',
        imageUrl: 'https://picsum.photos/seed/bitcoin/800/1600'
      };
    } else if (lower.includes('rüzgar') || lower.includes('wind') || lower.includes('enerji')) {
      return {
        title: 'Wind Energy Farm',
        type: 'Impact',
        description: 'AI Identified: Impact Project. Maximum carbon offset value.',
        impactScore: 95,
        estReturn: '+5.1%',
        imageUrl: 'https://picsum.photos/seed/wind/800/1600'
      };
    }
    
    return {
      title: 'Optimized Route',
      type: 'Mixed',
      description: `AI Identified: Standard Intent. Routed for balanced yield and impact.`,
      impactScore: 60,
      estReturn: '+7.5%',
      imageUrl: 'https://picsum.photos/seed/ai/800/1600'
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsAnalyzing(false);
      const result = analyzeIntent(intent);
      onIntentSubmit(intent, result);
      setIntent('');
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-6 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-aqua hover:bg-aqua/10 transition-colors z-40"
      >
        <Sparkles size={24} />
      </button>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm z-50"
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 glass-panel rounded-t-3xl p-6 z-50 border-t border-aqua/30"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-aqua">
                  <Sparkles size={20} />
                  <h3 className="font-bold">IATF Intent Solver</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="e.g., Buy $500 Tesla with high impact..."
                  className="w-full bg-obsidian-light/50 border border-gray-700 rounded-xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-aqua transition-colors"
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !intent.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-aqua disabled:text-gray-600 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>

              {isAnalyzing && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-aqua mt-4 text-center font-mono"
                >
                  Analyzing intent & routing for max impact...
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
