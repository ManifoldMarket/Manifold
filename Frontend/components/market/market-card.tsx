'use client';

import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { Market } from '@/types';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  market: Market;
  onClick: (market: Market) => void;
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  const isPositive = market.change >= 0;

  return (
    <div
      onClick={() => onClick(market)}
      className="group bg-zinc-900/80 border border-zinc-800/60 rounded-[24px] pt-6 px-6 pb-6 w-[301px] h-[252px] cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Badge>{market.category}</Badge>
        {market.status === 'live' && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-base mb-1 group-hover:text-blue-400 transition-colors">
        {market.title}
      </h3>
      <p className="text-zinc-500 text-sm mb-5">{market.subtitle}</p>

      {/* Volume */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-800/60 px-2.5 py-1 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-sm font-semibold text-white">{market.volume}</span>
            <span className="text-xs text-zinc-500">Vol</span>
          </div>
        </div>
        <span className={cn('text-xs font-medium flex items-center gap-0.5', isPositive ? 'text-emerald-400' : 'text-red-400')}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{market.change}%
        </span>
      </div>

      {/* Outcome Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button className="bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 rounded-full py-2 px-3 transition-all duration-200">
          <div className="text-[10px] text-blue-400/70 mb-0.5">Yes</div>
          <div className="text-sm font-bold">{market.yesPrice}¢</div>
        </button>
        <button className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-400 rounded-full py-2 px-3 transition-all duration-200">
          <div className="text-[10px] text-zinc-500 mb-0.5">No</div>
          <div className="text-sm font-bold">{market.noPrice}¢</div>
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {market.endDate}
        </span>
      </div>
    </div>
  );
}
