'use client';

import type { Metadata } from 'next';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BOT_CHAIN_NETWORKS } from '@/utils/chains';
import { Header } from '@/components/Header';
import './globals.css';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [BOT_CHAIN_NETWORKS.testnet as any],
  transports: {
    [BOT_CHAIN_NETWORKS.testnet.id]: http(
      BOT_CHAIN_NETWORKS.testnet.rpcUrls.default.http[0]
    ),
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Header />
            <main className="min-h-screen bg-background">{children}</main>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
