'use client';

import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui';
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';
import {
  LeoWalletAdapter,
  FoxWalletAdapter,
  PuzzleWalletAdapter,
  SoterWalletAdapter,
} from 'aleo-adapters';

import '@demox-labs/aleo-wallet-adapter-reactui/styles.css';

const PROGRAM_ID = 'predictionprivacyhackviii.aleo';
const CREDITS_PROGRAM = 'credits.aleo';

const ALEO_NETWORK = WalletAdapterNetwork.TestnetBeta;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: 'Manifold',
      }),
      new FoxWalletAdapter({
        appName: 'Manifold',
      }),
      new PuzzleWalletAdapter({
        appName: 'Manifold',
        appDescription: 'Privacy-first prediction markets on Aleo',
        programIdPermissions: {
          [ALEO_NETWORK]: [PROGRAM_ID],
          [WalletAdapterNetwork.TestnetBeta]: [PROGRAM_ID],
          [WalletAdapterNetwork.MainnetBeta]: [PROGRAM_ID],
        },
      }),
      new SoterWalletAdapter({
        appName: 'Manifold',
      }),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider
        wallets={wallets}
        decryptPermission={DecryptPermission.UponRequest}
        network={ALEO_NETWORK}
        programs={[PROGRAM_ID, CREDITS_PROGRAM]}
        autoConnect
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
