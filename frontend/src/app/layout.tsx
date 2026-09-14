'use client';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { BOT_CHAIN_NETWORKS } from '@/utils/chains';
import { Header } from '@/components/Header';
import './globals.css';

const botChainTestnet = {
  id: BOT_CHAIN_NETWORKS.testnet.id,
  name: BOT_CHAIN_NETWORKS.testnet.name,
  network: 'bot-testnet',
  nativeCurrency: BOT_CHAIN_NETWORKS.testnet.nativeCurrency,
  rpcUrls: BOT_CHAIN_NETWORKS.testnet.rpcUrls,
  blockExplorers: BOT_CHAIN_NETWORKS.testnet.blockExplorers,
  testnet: true,
} as const;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [botChainTestnet],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: BOT_CHAIN_NETWORKS.testnet.rpcUrls.default.http[0],
      }),
    }),
    publicProvider(),
  ]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={config}>
          <Header />
          <main className="min-h-screen bg-background">{children}</main>
        </WagmiConfig>
      </body>
    </html>
  );
}

