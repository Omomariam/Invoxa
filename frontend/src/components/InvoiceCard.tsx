'use client';

import React from 'react';
import { Invoice } from '@/utils/types';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';
import Link from 'next/link';
import { Eye, Download } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const displayStatus = isOverdue(invoice.dueDate, invoice.status)
    ? 'overdue'
    : invoice.status;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Invoice #{invoice.invoiceNumber}
          </h3>
          <p className="text-sm text-gray-600">{invoice.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            statusColors[displayStatus as keyof typeof statusColors]
          }`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
          <p className="text-sm font-mono text-gray-900">
            {formatAddress(invoice.clientAddress)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
          <p className="text-lg font-bold text-primary">
            {formatAmount(invoice.amount)} BOT
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Due Date</span>
          <span className="font-medium text-gray-900">
            {formatDate(invoice.dueDate)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Created</span>
          <span className="font-medium text-gray-900">
            {formatDate(invoice.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/invoice/${invoice.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye size={16} />
          View
        </Link>
        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
};
