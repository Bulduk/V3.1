'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'RWA' | 'Crypto' | 'Impact' | 'ETF';
  price: number;
  balance: number;
  icon: string;
  intentName: string;
  intentEffect: string;
}

export function useUniversalEngine() {
  const [totalValue, setTotalValue] = useState(12450.75);
  const [impactScore, setImpactScore] = useState(8420);
  const [intentScore, setIntentScore] = useState(120); // New: Intent Score
  const [impactTokens, setImpactTokens] = useState(142.0);
  
  const [assets, setAssets] = useState<Record<string, Asset>>({
    'tsla': { 
      id: 'tsla', symbol: 'TSLA', name: 'Tesla Inc.', type: 'RWA', price: 175.50, balance: 15.2, icon: '🚗',
      intentName: 'Sustainable Transport Intent', intentEffect: 'Karbon Azaltımı'
    },
    'btc': { 
      id: 'btc', symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', price: 64000.00, balance: 0.05, icon: '₿',
      intentName: 'Digital Sovereignty Intent', intentEffect: 'Finansal Özgürlük'
    },
    'ibit': { 
      id: 'ibit', symbol: 'IBIT', name: 'iShares Bitcoin ETF', type: 'ETF', price: 35.20, balance: 100, icon: '🏛️',
      intentName: 'Institutional Adoption Intent', intentEffect: 'Pazar Stabilitesi'
    },
    'clean': { 
      id: 'clean', symbol: 'CLEAN', name: 'Wind Energy Farm', type: 'Impact', price: 12.50, balance: 0, icon: '🌬️',
      intentName: 'Renewable Future Intent', intentEffect: 'Yeşil Enerji'
    },
    'usdc': { 
      id: 'usdc', symbol: 'USDC', name: 'USD Coin', type: 'Crypto', price: 1.00, balance: 5000, icon: '💵',
      intentName: 'Stable Value Intent', intentEffect: 'Likidite'
    },
  });

  // Real-Time Oracle & Dynamic Yield Streamer
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Dynamic Yield: Stream $IMPACT tokens based on holding RWA/Impact assets
      setImpactTokens(prev => prev + 0.005);

      // 2. Mock Oracle: Update prices slightly to simulate live market
      setAssets(prev => {
        const next = { ...prev };
        if (next['tsla']) {
          const change = (Math.random() - 0.5) * 0.4;
          next['tsla'].price = Math.max(0, next['tsla'].price + change);
        }
        if (next['clean']) {
          const change = (Math.random() - 0.5) * 0.1;
          next['clean'].price = Math.max(0, next['clean'].price + change);
        }
        return next;
      });

      // 3. Update Total Value based on live prices
      setTotalValue(prev => prev + (Math.random() - 0.5) * 2.5);
      
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const executeSwap = useCallback((fromId: string, toId: string, amountUsd: number) => {
    setAssets(prev => {
      const next = { ...prev };
      const fromAsset = next[fromId];
      const toAsset = next[toId];

      if (fromAsset && toAsset) {
        const fromAmount = amountUsd / fromAsset.price;
        const toAmount = amountUsd / toAsset.price;
        
        fromAsset.balance -= fromAmount;
        toAsset.balance += toAmount;
      }
      return next;
    });

    // Boost impact score significantly when swapping to an Impact asset
    if (assets[toId]?.type === 'Impact') {
      setImpactScore(prev => prev + Math.floor(amountUsd * 0.5));
      setIntentScore(prev => prev + Math.floor(amountUsd * 0.1)); // Reward Intent Score
    }
  }, [assets]);

  return {
    totalValue,
    impactScore,
    intentScore,
    impactTokens,
    assets,
    executeSwap
  };
}
