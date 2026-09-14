'use client';

import React from 'react';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { InvoiceCard } from '@/components/InvoiceCard';
import { useAccount } from 'wagmi';

export default function History() {
  const { isConnected } = useAccount();
  const { invoices } = useInvoiceStore();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Please connect your wallet to view invoice history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Invoice History</h1>
        <p className="text-gray-600 mt-2">
          View all your invoices ({invoices.length})
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 text-lg">No invoices yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
