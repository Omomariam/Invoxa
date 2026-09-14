'use client';

import React from 'react';
import Link from 'next/link';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { InvoiceCard } from '@/components/InvoiceCard';
import { useAccount } from 'wagmi';
import { AlertCircle, FileText, PlusCircle } from 'lucide-react';

export default function History() {
  const { isConnected } = useAccount();
  const { invoices } = useInvoiceStore();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-12 text-center max-w-md mx-auto animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wallet Required
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Please connect your wallet to view invoice history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Invoice History
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          View all your invoices ({invoices.length})
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="glass-card p-16 text-center animate-fade-in-up-delay-1">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FileText size={36} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            No invoices yet
          </h3>
          <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Your invoice history will appear here once you create your first invoice
          </p>
          <Link href="/create" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={18} />
            Create Your First Invoice
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up-delay-1">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
