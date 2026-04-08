'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Leaf, TrendingUp, ShieldCheck } from 'lucide-react';

export interface FeedItemData {
  id: string;
  title: string;
  type: 'Crypto' | 'Stock' | 'RWA' | 'Impact';
  description: string;
  impactScore: number;
  estReturn: string;
  imageUrl: string;
  socialProof: string;
}

interface FeedItemProps {
  data: FeedItemData;
  isActive: boolean;
}

export function FeedItem({ data, isActive }: FeedItemProps) {
  return (
    <div className="relative w-full h-[100dvh] flex-shrink-0 snap-start overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={data.imageUrl}
          alt={data.title}
          fill
          className="object-cover opacity-60"
          referrerPolicy="no-referrer"
          priority={isActive}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/60 to-obsidian" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-64 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-block px-3 py-1 rounded-full glass-panel text-xs font-mono text-aqua mb-4">
            {data.type}
          </div>
          
          <h1 className="text-4xl font-bold mb-2 tracking-tight">{data.title}</h1>
          <p className="text-gray-300 text-sm mb-6 max-w-[80%]">{data.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border-neon-green/20">
              <Leaf className="text-neon-green mb-2" size={24} />
              <span className="text-2xl font-bold text-neon-green">{data.impactScore}</span>
              <span className="text-xs text-gray-400">Impact Score</span>
            </div>
            
            <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border-aqua/20">
              <TrendingUp className="text-aqua mb-2" size={24} />
              <span className="text-2xl font-bold text-aqua">{data.estReturn}</span>
              <span className="text-xs text-gray-400">Est. Return</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-obsidian-light/50 p-3 rounded-xl backdrop-blur-md">
            <ShieldCheck size={16} className="text-aqua" />
            {data.socialProof}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
