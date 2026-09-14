'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { formatAddress } from '@/utils/formatting';

export const Header = () => {
  const { address, isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Invoxa</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Create Invoice
            </Link>
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              History
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isConnected && address && (
              <div className="text-sm text-gray-600">
                {formatAddress(address)}
              </div>
            )}
            {/* Connect wallet button will go here */}
          </div>
        </div>
      </div>
    </header>
  );
};
