'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors/injected';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { DEFAULT_CHAIN } from '@/utils/chains';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const config = createConfig({
  chains: [DEFAULT_CHAIN],
  connectors: [injected()],
  transports: { [DEFAULT_CHAIN.id]: http(DEFAULT_CHAIN.rpcUrls.default.http[0]) },
  ssr: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Footer />
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

