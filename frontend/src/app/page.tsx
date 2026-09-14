'use client';

import React from 'react';
import Link from 'next/link';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useAccount } from 'wagmi';
import { InvoiceCard } from '@/components/InvoiceCard';
import { PlusCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const {
    invoices,
    getPaidInvoices,
    getPendingInvoices,
    getOverdueInvoices,
  } = useInvoiceStore();

  const paidInvoices = getPaidInvoices();
  const pendingInvoices = getPendingInvoices();
  const overdueInvoices = getOverdueInvoices();

  const totalPaid = paidInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  );

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Invoxa
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Invoice. Get paid. Prove it.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Connect your wallet to get started
          </p>
          {/* Wallet connection button */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your invoices and payments</p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PlusCircle size={20} />
          New Invoice
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Paid</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {totalPaid.toFixed(2)} BOT
              </p>
            </div>
            <TrendingUp className="text-secondary" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {invoices.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {pendingInvoices.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {overdueInvoices.length}
          </p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Invoices</h2>

        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No invoices yet</p>
            <Link
              href="/create"
              className="text-primary font-medium hover:underline mt-2 inline-block"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.slice(0, 6).map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
