import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const Providers = dynamic(() => import('@/components/providers').then(mod => mod.Providers), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlockSeer - Blockchain Prediction Markets',
  description: 'Trade on crypto events with zero-knowledge privacy on Aleo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-zinc-950">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-950/10 via-zinc-950 to-purple-950/10 pointer-events-none" />
            <div className="relative">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
