'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ConversionSliderProps {
  value: number;
  max: number;
  onChange: (val: number) => void;
}

export function ConversionSlider({ value, max, onChange }: ConversionSliderProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full py-4">
      <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
        <span>0%</span>
        <span className="text-neon-green font-bold">{Math.round(percentage)}% CONVERT</span>
        <span>100%</span>
      </div>
      
      <div className="relative h-2 bg-obsidian rounded-full border border-white/10 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 bottom-0 bg-neon-green/80"
          style={{ width: `${percentage}%` }}
          layoutId="slider-fill"
        />
        
        <input
          type="range"
          min="0"
          max={max}
          step={max / 100}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="text-center mt-3">
        <span className="text-2xl font-bold font-mono">${value.toFixed(2)}</span>
      </div>
    </div>
  );
}
