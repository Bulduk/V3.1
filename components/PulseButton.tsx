'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface ActionBarProps {
  onCommit: () => void;
  onSkip: () => void;
  onPressingChange?: (isPressing: boolean) => void;
  conversionValue: number;
  onConversionChange: (val: number) => void;
}

export function PulseButton({ onCommit, onSkip, onPressingChange, conversionValue, onConversionChange }: ActionBarProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let requestRef: number;
    let startTime: number | null = null;
    const duration = 1500;

    const animate = (time: number) => {
      if (startTime === null) {
        startTime = time;
      }
      const elapsed = time - startTime;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(currentProgress);

      if (currentProgress < 100) {
        requestRef = requestAnimationFrame(animate);
      } else {
        setIsPressing(false);
        onPressingChange?.(false);
        onCommit();
        setProgress(0);
      }
    };

    if (isPressing) {
      requestRef = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef) {
        cancelAnimationFrame(requestRef);
      }
    };
  }, [isPressing, onCommit, onPressingChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressing(true);
    onPressingChange?.(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressing(false);
    onPressingChange?.(false);
    setProgress(0);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 z-50" style={{ background: 'linear-gradient(to top, var(--color-bg-primary), transparent)' }}>
      {/* Slider */}
      <div className="mb-8 px-4">
        <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)] mb-2 font-mono tracking-widest">
          <span>0%</span>
          <span className="text-[var(--color-accent-2)] font-bold">{Math.round(conversionValue)}% CONVERT</span>
          <span>100%</span>
        </div>
        <div className="relative h-1.5 bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-[var(--color-accent-2)]"
            style={{ width: `${conversionValue}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={conversionValue}
            onChange={(e) => onConversionChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center px-4">
        <button
          onClick={onSkip}
          className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={24} />
        </button>

        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--color-accent-2)] blur-xl opacity-0"
            animate={{ opacity: isPressing ? 0.6 : 0, scale: isPressing ? 1.5 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <button
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-24 h-24 rounded-full glass-panel flex flex-col items-center justify-center overflow-hidden select-none touch-none"
            style={{ borderColor: 'color-mix(in srgb, var(--color-accent-2) 30%, transparent)' }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-[var(--color-accent-2)] transition-all duration-75 ease-linear opacity-40"
              style={{ height: `${progress}%` }}
            />
            <span className="relative z-10 font-bold tracking-widest text-[var(--color-accent-2)] text-sm">
              COMMIT
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
