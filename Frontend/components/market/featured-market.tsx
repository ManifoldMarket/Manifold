'use client';

import { Flame, DollarSign } from 'lucide-react';
import { Market } from '@/types';

interface FeaturedMarketProps {
  market: Market;
  onClick: (market: Market) => void;
}

export function FeaturedMarket({ market, onClick }: FeaturedMarketProps) {
  return (
    <div
      className="mb-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 cursor-pointer hover:border-blue-500/30 transition-all duration-300"
      onClick={() => onClick(market)}
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Trending</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{market.title}</h2>
          <p className="text-zinc-400">{market.description}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex items-center gap-1 text-lg font-bold text-emerald-400">
              <DollarSign className="w-4 h-4" />
              {market.volume}
            </div>
            <div className="text-xs text-zinc-500">Volume</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{market.yesPrice}%</div>
            <div className="text-xs text-zinc-500">Yes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-zinc-400">{market.noPrice}%</div>
            <div className="text-xs text-zinc-500">No</div>
          </div>
        </div>
      </div>
    </div>
  );
}
