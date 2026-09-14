'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useAccount } from 'wagmi';
import { QRCodeSVG } from 'qrcode.react';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';
import {
  Copy,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  ExternalLink,
} from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { getInvoiceById, updateInvoice } = useInvoiceStore();
  const invoice = getInvoiceById(id);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-12 text-center max-w-md mx-auto animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wallet Required
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Please connect your wallet to view invoice details
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-12 text-center max-w-md mx-auto animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-danger)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Invoice not found
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            This invoice may have been deleted or doesn't exist
          </p>
          <button
            onClick={() => router.push('/history')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const displayStatus = isOverdue(invoice.dueDate, invoice.status)
    ? 'overdue'
    : invoice.status;

  const statusClasses: Record<string, string> = {
    draft: 'status-badge status-draft',
    pending: 'status-badge status-pending',
    paid: 'status-badge status-paid',
    overdue: 'status-badge status-overdue',
  };

  const invoiceUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAsPaid = () => {
    updateInvoice(id, {
      status: 'paid',
      paidAt: Math.floor(Date.now() / 1000),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors animate-fade-in-up"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Invoice #{invoice.invoiceNumber}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{invoice.description}</p>
        </div>
        <span className={`${statusClasses[displayStatus] || 'status-badge status-draft'} text-sm`}>
          {displayStatus}
        </span>
      </div>

      {displayStatus === 'overdue' && (
        <div className="mb-6 p-4 rounded-xl flex gap-3 animate-fade-in-up"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
          <AlertCircle className="flex-shrink-0" size={20} style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#f87171' }}>This invoice is overdue</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card-static p-6 animate-fade-in-up-delay-1">
            <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Details</h2>

            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                  Amount
                </label>
                <p className="text-3xl font-bold mt-1" style={{
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {formatAmount(invoice.amount)} BOT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                    Issuer
                  </label>
                  <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatAddress(address || '')}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                    Client
                  </label>
                  <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatAddress(invoice.clientAddress)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                    Created
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                    Due Date
                  </label>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              {invoice.status === 'paid' && invoice.paidAt && (
                <div>
                  <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
                    Paid On
                  </label>
                  <p className="text-sm mt-1 font-medium" style={{ color: '#34d399' }}>
                    {formatDate(invoice.paidAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card-static p-6 animate-fade-in-up-delay-2">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {invoice.description}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="glass-card-static p-6 animate-fade-in-up-delay-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <QrCode size={16} style={{ color: 'var(--accent-primary)' }} />
                QR Code
              </h3>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--accent-primary)' }}
              >
                {showQR ? 'Hide' : 'Show'}
              </button>
            </div>

            {showQR && (
              <div className="flex justify-center p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="p-4 rounded-xl bg-white">
                  <QRCodeSVG value={invoiceUrl} size={180} level="H" />
                </div>
              </div>
            )}
          </div>

          {/* Payment Link */}
          <div className="glass-card-static p-6 animate-fade-in-up-delay-3">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={invoiceUrl}
                readOnly
                className="input-field flex-1 text-xs font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="btn-ghost px-3 flex items-center justify-center"
                title="Copy link"
              >
                {copied ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs mt-2 font-medium" style={{ color: '#34d399' }}>
                Copied to clipboard!
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="glass-card-static p-6 space-y-3 animate-fade-in-up-delay-4">
            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="btn-success w-full flex items-center justify-center gap-2 text-sm py-2.5"
              >
                <CheckCircle2 size={16} />
                Mark as Paid
              </button>
            )}

            <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
              <Share2 size={16} />
              Share
            </button>

            <button className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2.5">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.status === 'paid' && (
        <div className="glass-card-static p-6 animate-fade-in-up-delay-4">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
            Payment Receipt
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="font-medium inline-flex items-center gap-1.5" style={{ color: '#34d399' }}>
                <CheckCircle2 size={14} />
                Confirmed
              </span>
            </div>
            <div className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Received</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {formatAmount(invoice.amount)} BOT
              </span>
            </div>
            {invoice.transactionHash && (
              <div className="flex justify-between items-center py-3">
                <span style={{ color: 'var(--text-muted)' }}>Transaction</span>
                <a
                  href={`https://scan.botchain.ai/tx/${invoice.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm inline-flex items-center gap-1.5 transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {formatAddress(invoice.transactionHash)}
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
