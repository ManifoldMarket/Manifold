'use client';

import { useState, useEffect, useCallback } from 'react';
import { Market } from '@/types';
import { getAllPools, AleoPool } from '@/lib/aleo-client';

// Dummy pools to show when no real pools exist
const DUMMY_POOLS: Market[] = [
  {
    id: 'dummy-1',
    title: 'Bitcoin $150K by 2026',
    subtitle: 'Will BTC reach $150,000 USD?',
    category: 'Price',
    endDate: 'Dec 31, 2026',
    volume: '$0',
    traders: 0,
    yesPrice: 50,
    noPrice: 50,
    change: 0,
    status: 'upcoming',
    description: 'This market will resolve to Yes if Bitcoin reaches $150,000 USD on any major exchange before December 31, 2026.',
    resolution: 'Resolves based on price data from Coinbase, Binance, or Kraken.',
    history: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  },
  {
    id: 'dummy-2',
    title: 'Ethereum Flips Bitcoin',
    subtitle: 'ETH market cap exceeds BTC in 2026',
    category: 'DeFi',
    endDate: 'Dec 31, 2026',
    volume: '$0',
    traders: 0,
    yesPrice: 25,
    noPrice: 75,
    change: 0,
    status: 'upcoming',
    description: 'Will Ethereum\'s market capitalization exceed Bitcoin\'s market capitalization at any point in 2026?',
    resolution: 'Resolves based on CoinGecko market cap data.',
    history: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
  },
  {
    id: 'dummy-3',
    title: 'Aleo Top 20 by Market Cap',
    subtitle: 'ALEO enters top 20 cryptocurrencies',
    category: 'Token',
    endDate: 'Jun 30, 2026',
    volume: '$0',
    traders: 0,
    yesPrice: 35,
    noPrice: 65,
    change: 0,
    status: 'upcoming',
    description: 'Will Aleo (ALEO) enter the top 20 cryptocurrencies by market capitalization before June 30, 2026?',
    resolution: 'Resolves based on CoinGecko rankings.',
    history: [35, 35, 35, 35, 35, 35, 35, 35, 35, 35],
  },
];

// Convert Aleo pool to Market type
function aleoPoolToMarket(pool: AleoPool, index: number): Market {
  // Calculate yes/no prices based on stakes
  const totalStakes = pool.option_a_stakes + pool.option_b_stakes;
  let yesPrice = 50;
  let noPrice = 50;

  if (totalStakes > 0) {
    yesPrice = Math.round((pool.option_a_stakes / totalStakes) * 100);
    noPrice = 100 - yesPrice;
  }

  // Determine status based on pool status
  let status: 'live' | 'upcoming' | 'resolved' = 'upcoming';
  if (pool.status === 0) {
    status = 'live';
  } else if (pool.status === 2) {
    status = 'resolved';
  }

  // Convert deadline to readable date
  const deadline = new Date(pool.deadline * 1000);
  const endDate = deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Convert total staked to volume string (microcredits to Aleo)
  const volumeInAleo = pool.total_staked / 1_000_000;
  const volume = volumeInAleo >= 1000
    ? `$${(volumeInAleo / 1000).toFixed(1)}K`
    : `$${volumeInAleo.toFixed(2)}`;

  return {
    id: pool.id,
    title: `Pool #${index + 1}`, // Since titles are hashed, use index
    subtitle: `Prediction pool with ${pool.total_no_of_stakes} predictions`,
    category: 'DeFi',
    endDate,
    volume,
    traders: pool.total_no_of_stakes,
    yesPrice,
    noPrice,
    change: 0,
    status,
    description: `A prediction pool on Manifold. Total staked: ${volumeInAleo.toFixed(2)} ALEO.`,
    resolution: 'This market resolves based on the pool outcome determined by the admin.',
    history: [yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice, yesPrice],
  };
}

export function useAleoPools() {
  const [pools, setPools] = useState<Market[]>(DUMMY_POOLS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all pools from the pools_id storage on chain
      const aleoPools = await getAllPools();

      if (aleoPools.length > 0) {
        const fetchedPools = aleoPools.map((pool, i) => aleoPoolToMarket(pool, i));
        setPools(fetchedPools);
        setIsLoading(false);
        return;
      }

      // No real pools found, use dummy pools
      console.log('No pools found on chain, using dummy data');
      setPools(DUMMY_POOLS);
    } catch (err) {
      console.error('Error fetching pools:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
      // Fall back to dummy pools on error
      setPools(DUMMY_POOLS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const refetch = useCallback(() => {
    fetchPools();
  }, [fetchPools]);

  return {
    pools,
    isLoading,
    error,
    refetch,
    isDummyData: pools === DUMMY_POOLS || pools.length === 0,
  };
}

// Export dummy pools for use in other places
export { DUMMY_POOLS };
