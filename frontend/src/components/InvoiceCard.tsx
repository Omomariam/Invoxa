'use client';

import React from 'react';
import { Invoice } from '@/utils/types';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';
import Link from 'next/link';
import { Eye, Download, ArrowUpRight } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const displayStatus = isOverdue(invoice.dueDate, invoice.status)
    ? 'overdue'
    : invoice.status;

  const statusClasses: Record<string, string> = {
    draft: 'status-badge status-draft',
    pending: 'status-badge status-pending',
    paid: 'status-badge status-paid',
    overdue: 'status-badge status-overdue',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start mb-5">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            Invoice #{invoice.invoiceNumber}
          </h3>
          <p className="text-sm truncate mt-1" style={{ color: 'var(--text-muted)' }}>
            {invoice.description}
          </p>
        </div>
        <span className={statusClasses[displayStatus] || 'status-badge status-draft'}>
          {displayStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Client
          </p>
          <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
            {formatAddress(invoice.clientAddress)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Amount
          </p>
          <p className="text-lg font-bold" style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {formatAmount(invoice.amount)} BOT
          </p>
        </div>
      </div>

      <div className="pt-4 mb-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--text-muted)' }}>Due Date</span>
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(invoice.dueDate)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Created</span>
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(invoice.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/invoice/${invoice.id}`}
          className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
        >
          <Eye size={15} />
          View
        </Link>
        <button className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
          <Download size={15} />
          Export
        </button>
      </div>
    </div>
  );
};
