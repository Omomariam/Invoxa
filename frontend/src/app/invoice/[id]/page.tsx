'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useAccount } from 'wagmi';
import QRCode from 'qrcode.react';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';
import { Copy, Download, Share2, AlertCircle } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-lg text-gray-600">
          Please connect your wallet to view invoice details
        </p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-lg text-gray-600">Invoice not found</p>
          <button
            onClick={() => router.push('/history')}
            className="text-primary font-medium hover:underline mt-4"
          >
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const displayStatus = isOverdue(invoice.dueDate, invoice.status)
    ? 'overdue'
    : invoice.status;

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
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
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice #{invoice.invoiceNumber}
          </h1>
          <p className="text-gray-600 mt-2">{invoice.description}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full font-semibold ${
            statusColors[displayStatus as keyof typeof statusColors]
          }`}
        >
          {displayStatus}
        </span>
      </div>

      {displayStatus === 'overdue' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">This invoice is overdue</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <p className="text-3xl font-bold text-primary mt-1">
                  {formatAmount(invoice.amount)} BOT
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Issuer</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {formatAddress(address || '')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Client</label>
                  <p className="text-sm font-mono text-gray-900 mt-1">
                    {formatAddress(invoice.clientAddress)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Due Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              {invoice.status === 'paid' && invoice.paidAt && (
                <div>
                  <label className="text-sm text-gray-600">Paid On</label>
                  <p className="text-sm text-green-700 mt-1 font-medium">
                    {formatDate(invoice.paidAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">QR Code</h3>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-primary hover:underline text-sm font-medium"
              >
                {showQR ? 'Hide' : 'Show'}
              </button>
            </div>

            {showQR && (
              <div className="flex justify-center p-4 bg-gray-50 rounded">
                <QRCode value={invoiceUrl} size={200} level="H" />
              </div>
            )}
          </div>

          {/* Payment Link */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={invoiceUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            {copied && <p className="text-sm text-green-600 mt-2">Copied!</p>}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                Mark as Paid
              </button>
            )}

            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              <Share2 size={16} />
              Share
            </button>

            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.status === 'paid' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Receipt</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">Confirmed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received</span>
              <span className="font-medium text-gray-900">
                {formatAmount(invoice.amount)} BOT
              </span>
            </div>
            {invoice.transactionHash && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction</span>
                <a
                  href={`https://scan.botchain.ai/tx/${invoice.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono text-sm"
                >
                  {formatAddress(invoice.transactionHash)}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
