'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ArrowRight, FileText, Loader2, Menu, Wallet, X } from 'lucide-react';
import { formatAddress } from '@/utils/formatting';

const appLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/history', label: 'Invoices' },
  { href: '/create', label: 'New invoice' },
];

const landingLinks = [
  { href: '#product', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
];

export const Header = () => {
  const pathname = usePathname();
  const isLanding = pathname === '/';
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnect = () => {
    const injected = connectors.find((connector) => connector.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/history') return pathname.startsWith('/history') || pathname.startsWith('/invoice/');
    return pathname.startsWith(href);
  };

  const navigation = isLanding ? landingLinks : appLinks;

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Invoxa home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#17201c] text-white"><FileText size={16} strokeWidth={2.2} /></span>
            <span className="text-base font-bold tracking-tight">Invoxa</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navigation.map((link) => (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${!isLanding && isActive(link.href) ? 'bg-[#f0f2ee] text-[#17201c]' : 'text-[#66716b] hover:text-[#17201c]'}`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isLanding ? (
            <Link href="/dashboard" className="btn-primary">Open app <ArrowRight size={16} /></Link>
          ) : isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 sm:flex" style={{ borderColor: 'var(--border)' }}>
                <span className="h-2 w-2 rounded-full bg-[#16794b]" aria-hidden="true" />
                <span className="font-mono text-xs font-medium">{formatAddress(address)}</span>
              </div>
              <button onClick={() => disconnect()} className="btn-ghost px-3" title="Disconnect wallet">Disconnect</button>
            </div>
          ) : (
            <button onClick={handleConnect} disabled={isConnecting} className="btn-primary">
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              <span className="hidden sm:inline">{isConnecting ? 'Connecting' : 'Connect wallet'}</span>
              <span className="sm:hidden">Connect</span>
            </button>
          )}

          <button className="btn-ghost px-2 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t px-4 py-3 md:hidden" style={{ borderColor: 'var(--border)' }} aria-label="Mobile navigation">
          {navigation.map((link) => (
            <Link key={link.href} href={link.href} className={`block rounded-md px-3 py-2.5 text-sm font-medium ${!isLanding && isActive(link.href) ? 'bg-[#f0f2ee]' : 'text-[#66716b]'}`} onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};
