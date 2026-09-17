'use client';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { BOT_CHAIN_NETWORKS } from '@/utils/chains';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
  connectors: [
    new InjectedConnector({ chains }),
  ],
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
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
        </WagmiConfig>
      </body>
    </html>
  );
}

