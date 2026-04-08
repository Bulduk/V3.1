'use client';

import React, { useEffect, useState } from 'react';

interface CircularScoreProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export function CircularScore({ score, size = 60, strokeWidth = 6 }: CircularScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simple animation effect
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine color based on score using CSS variables
  let colorVar = 'var(--color-accent-2)'; // Green for high
  if (score < 40) colorVar = 'var(--color-accent-red)'; // Red for low
  else if (score < 70) colorVar = 'var(--color-accent-1)'; // Blue/Yellow for medium

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="absolute transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorVar}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono" style={{ color: colorVar }}>
          {Math.round(animatedScore)}
        </span>
      </div>
    </div>
  );
}
