import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Custom Aleo chain configuration (placeholder - update with actual Aleo chain details)
export const aleoChain = {
  id: 1000,
  name: 'Aleo Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Aleo Credits',
    symbol: 'ALEO',
  },
  rpcUrls: {
    default: { http: ['https://api.explorer.aleo.org/v1'] },
  },
  blockExplorers: {
    default: { name: 'Aleo Explorer', url: 'https://explorer.aleo.org' },
  },
} as const;

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
