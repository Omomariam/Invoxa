'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { formatAddress } from '@/utils/formatting';
import { Menu, X, Zap, Wallet, LogOut, Loader2 } from 'lucide-react';

export const Header = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === 'injected') || connectors[0];
    if (injected) {
      connect({ connector: injected });
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-card-static" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'var(--gradient-primary)' }}>
              <Zap size={18} className="text-white relative z-10" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Inv<span style={{ color: 'var(--accent-primary)' }}>oxa</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/', label: 'Dashboard' },
              { href: '/create', label: 'Create Invoice' },
              { href: '/history', label: 'History' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet & Connect */}
          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                {/* Connected wallet display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent-success)' }} />
                  <span className="text-sm font-mono font-medium" style={{ color: '#34d399' }}>
                    {formatAddress(address)}
                  </span>
                </div>
                {/* Disconnect button */}
                <button
                  onClick={() => disconnect()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                  }}
                  title="Disconnect wallet"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-60"
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="hidden sm:inline">Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet size={16} />
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 animate-fade-in-up" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {[
              { href: '/', label: 'Dashboard' },
              { href: '/create', label: 'Create Invoice' },
              { href: '/history', label: 'History' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
