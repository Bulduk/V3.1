'use client';

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, BarChart, Bar, Cell, ComposedChart } from 'recharts';
import { MOCK_MARKETS, PredictionOption } from '@/lib/mockData';
import { CircularScore } from '@/components/CircularScore';

// Order book generator
const generateOrderBook = (currentPrice: number) => {
  const asks = [];
  const bids = [];
  for(let i=5; i>0; i--) asks.push({ price: Math.min(99, currentPrice + i), amount: Math.floor(Math.random() * 5000) + 100 });
  for(let i=1; i<=5; i++) bids.push({ price: Math.max(1, currentPrice - i), amount: Math.floor(Math.random() * 5000) + 100 });
  return { asks, bids };
};

export default function MarketDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const market = MOCK_MARKETS.find(m => m.id === resolvedParams.id) || MOCK_MARKETS[0];
  
  const [selectedOption, setSelectedOption] = useState<PredictionOption>(market.options[0]);
  const [amount, setAmount] = useState<string>('');
  const [orderBook, setOrderBook] = useState(generateOrderBook(selectedOption.price));
  
  // Momentum specific state
  const [leverage, setLeverage] = useState<number>(1);
  const [momentumData, setMomentumData] = useState<{val: number, momentum: number}[]>([]);

  useEffect(() => {
    setSelectedOption(market.options[0]);
  }, [market]);

  useEffect(() => {
    setOrderBook(generateOrderBook(selectedOption.price));
    
    if (market.model === 'MOMENTUM') {
      setMomentumData(Array.from({length: 20}, (_, i) => ({
        val: selectedOption.price + (Math.random()*10-5),
        momentum: Math.random() * 100 - 50
      })));
    }
  }, [selectedOption, market.model]);

  const handlePercentage = (pct: number) => {
    // Mock balance of 1000 USDC
    setAmount((1000 * pct).toFixed(2));
  };

  const handleTrade = () => {
    if (!amount || isNaN(Number(amount))) return;
    const leverageText = market.model === 'MOMENTUM' ? ` with ${leverage}x Boost` : '';
    alert(`Order Placed: $${amount} on ${selectedOption.label}${leverageText}`);
    setAmount('');
  };

  // Chart colors (need hex for Recharts)
  const CHART_GREEN = '#10B981';
  const CHART_RED = '#EF4444';
  const CHART_BLUE = '#3B82F6';

  return (
    <main className="min-h-[100dvh] flex flex-col pb-20 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--color-border)]">
              <Image src={market.imageUrl} alt="icon" fill className="object-cover" />
            </div>
            <h1 className="font-bold text-sm leading-tight max-w-[200px] truncate">{market.title}</h1>
          </div>
        </div>
        <CircularScore score={market.stats.score} size={36} strokeWidth={3} />
      </header>

      {/* Chart Section */}
      <div className="w-full h-48 border-b border-[var(--color-border)] p-2 bg-[var(--color-bg-primary)]">
        <div className="flex justify-between items-center px-2 mb-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            {market.model === 'MOMENTUM' ? 'Price & Velocity' : 'Price History'}
          </span>
          <div className="flex items-center gap-3">
            {market.model === 'MOMENTUM' && (
              <span className="text-[10px] font-bold text-[var(--color-accent-1)] bg-[var(--color-accent-1)]/10 px-1.5 py-0.5 rounded border border-[var(--color-accent-1)]/20">
                VELOCITY: +2.4/s
              </span>
            )}
            <span className={`text-sm font-mono font-bold ${selectedOption.color === 'red' ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-accent-2)]'}`}>
              {selectedOption.price}¢
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          {market.model === 'MOMENTUM' ? (
            <ComposedChart data={momentumData}>
              <YAxis yAxisId="left" domain={['dataMin - 5', 'dataMax + 5']} hide />
              <YAxis yAxisId="right" orientation="right" domain={[-100, 100]} hide />
              <Bar yAxisId="right" dataKey="momentum" radius={[2, 2, 0, 0]}>
                {momentumData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.momentum > 0 ? CHART_GREEN : CHART_RED} fillOpacity={0.4} />
                ))}
              </Bar>
              <Line yAxisId="left" type="stepAfter" dataKey="val" stroke={CHART_BLUE} strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
            <LineChart data={Array.from({length: 20}, (_, i) => ({ val: selectedOption.price + (Math.random()*10-5) }))}>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Line type="stepAfter" dataKey="val" stroke={selectedOption.color === 'red' ? CHART_RED : CHART_GREEN} strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Trading Interface (Side by Side) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Order Book */}
        <div className="w-5/12 border-r border-[var(--color-border)] flex flex-col text-xs font-mono bg-[var(--color-bg-card)]">
          <div className="flex justify-between p-2 text-[var(--color-text-secondary)] font-medium">
            <span>Price</span>
            <span>Amount</span>
          </div>
          
          {/* Asks (Red) */}
          <div className="flex flex-col-reverse flex-1 overflow-hidden px-2">
            {orderBook.asks.map((ask, i) => (
              <div key={i} className="flex justify-between py-1 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-[var(--color-accent-red)]/10" style={{ width: `${(ask.amount / 5000) * 100}%` }} />
                <span className="text-[var(--color-accent-red)] relative z-10">{ask.price}</span>
                <span className="text-[var(--color-text-secondary)] relative z-10">{ask.amount}</span>
              </div>
            ))}
          </div>
          
          {/* Current Price Divider */}
          <div className={`py-2 text-center border-y border-[var(--color-border)] font-bold text-lg ${selectedOption.color === 'red' ? 'text-[var(--color-accent-red)]' : 'text-[var(--color-accent-2)]'}`}>
            {selectedOption.price}¢
          </div>

          {/* Bids (Green) */}
          <div className="flex flex-col flex-1 overflow-hidden px-2">
            {orderBook.bids.map((bid, i) => (
              <div key={i} className="flex justify-between py-1 relative">
                <div className="absolute right-0 top-0 bottom-0 bg-[var(--color-accent-2)]/10" style={{ width: `${(bid.amount / 5000) * 100}%` }} />
                <span className="text-[var(--color-accent-2)] relative z-10">{bid.price}</span>
                <span className="text-[var(--color-text-secondary)] relative z-10">{bid.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Entry */}
        <div className="w-7/12 p-3 flex flex-col bg-[var(--color-bg-card)]">
          
          {/* Option Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {market.options.map(opt => (
              <button 
                key={opt.id}
                onClick={() => setSelectedOption(opt)}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors border ${selectedOption.id === opt.id ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] border-[var(--color-text-primary)]' : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Order Type */}
          {market.model === 'MOMENTUM' ? (
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-text-primary)] border-b border-[var(--color-text-primary)] border-dashed">Snipe</span>
              <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors">Market</span>
              <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors">Trailing</span>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-4 text-xs font-bold text-[var(--color-text-secondary)]">
              <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors">Limit</span>
              <span className="text-[var(--color-text-primary)] border-b border-[var(--color-text-primary)] border-dashed">Market</span>
              <span className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors">Stop</span>
            </div>
          )}

          {/* Momentum Boost Multiplier */}
          {market.model === 'MOMENTUM' && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)] mb-2 font-bold uppercase tracking-wider">
                <span>Boost Multiplier</span>
                <span className="text-[var(--color-accent-1)]">{leverage}x</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 5, 10].map(lx => (
                  <button 
                    key={lx}
                    onClick={() => setLeverage(lx)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors border ${leverage === lx ? 'bg-[var(--color-accent-1)]/10 text-[var(--color-accent-1)] border-[var(--color-accent-1)]/30' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'}`}
                  >
                    {lx}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="bg-[var(--color-bg-primary)] rounded flex items-center px-2 py-2 mb-3 border border-[var(--color-border)] focus-within:border-[var(--color-accent-1)] transition-colors">
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent w-full outline-none text-sm font-mono text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]/50"
            />
            <span className="text-xs text-[var(--color-text-secondary)] font-bold ml-2">USDC</span>
          </div>

          {/* Percentages */}
          <div className="flex justify-between gap-1 mb-6">
            {[0.25, 0.5, 0.75, 1].map(pct => (
              <button 
                key={pct}
                onClick={() => handlePercentage(pct)}
                className="flex-1 bg-[var(--color-bg-primary)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded py-1 text-[10px] font-mono text-[var(--color-text-secondary)] transition-colors"
              >
                {pct * 100}%
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-auto mb-4 text-xs flex justify-between text-[var(--color-text-secondary)]">
            <span>Avail</span>
            <span className="font-mono text-[var(--color-text-primary)] font-medium">1000.00 USDC</span>
          </div>

          {/* Buy Button */}
          <button 
            onClick={handleTrade}
            className={`w-full py-3 rounded font-bold text-sm text-white transition-opacity hover:opacity-90 shadow-sm ${selectedOption.color === 'red' ? 'bg-[var(--color-accent-red)]' : 'bg-[var(--color-accent-2)]'}`}
          >
            BUY {selectedOption.label}
          </button>

        </div>
      </div>
    </main>
  );
}
