'use client';

import { useMemo } from 'react';
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
    <WalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.MainnetBeta}
      autoConnect
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}
