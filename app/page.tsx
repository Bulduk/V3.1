'use client';

import React, { useState } from 'react';
import { HomeFeed } from '@/components/HomeFeed';
import { MarketsView } from '@/components/MarketsView';
import { Home, BarChart2, PieChart, User } from 'lucide-react';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <main className="relative w-full h-[100dvh] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] overflow-hidden flex flex-col">
      
      {/* Active View */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && <HomeFeed />}
        {activeTab === 'markets' && <MarketsView />}
        {activeTab === 'portfolio' && (
          <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
            Portfolio Screen (Coming Soon)
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
            Profile Screen (Coming Soon)
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[var(--color-bg-primary)]/90 backdrop-blur-xl border-t border-[var(--color-border)] flex justify-around items-center px-6 pb-safe z-50">
        <NavButton icon={<Home size={24} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<BarChart2 size={24} />} label="Markets" isActive={activeTab === 'markets'} onClick={() => setActiveTab('markets')} />
        <NavButton icon={<PieChart size={24} />} label="Portfolio" isActive={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
        <NavButton icon={<User size={24} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </main>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[var(--color-accent-2)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}
