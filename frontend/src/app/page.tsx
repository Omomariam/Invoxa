'use client';

import React from 'react';
import Link from 'next/link';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useAccount } from 'wagmi';
import { InvoiceCard } from '@/components/InvoiceCard';
import {
  PlusCircle,
  TrendingUp,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

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
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                }}>
                <Zap size={14} />
                Powered by BOT Chain
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up-delay-1">
              <span style={{ color: 'var(--text-primary)' }}>Invoice. </span>
              <span style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Get paid.
              </span>
              <br />
              <span style={{ color: 'var(--text-primary)' }}>Prove it.</span>
            </h1>

            <p className="text-lg sm:text-xl mb-10 max-w-xl mx-auto animate-fade-in-up-delay-2"
              style={{ color: 'var(--text-secondary)' }}>
              Create, send, and track invoices on the blockchain.
              Transparent payments with cryptographic proof.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">
              <Link href="/create" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5">
                <PlusCircle size={20} />
                Create Invoice
              </Link>
              <Link href="/history" className="btn-secondary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5">
                View History
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 animate-fade-in-up-delay-4">
              {[
                { icon: Shield, title: 'On-Chain Proof', desc: 'Every payment is recorded on the blockchain' },
                { icon: Zap, title: 'Instant Settlement', desc: 'Receive payments directly to your wallet' },
                { icon: Globe, title: 'Global Access', desc: 'Send invoices to anyone, anywhere' },
              ].map((feature, i) => (
                <div key={i} className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                    <feature.icon size={22} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Manage your invoices and payments
          </p>
        </div>
        <Link href="/create" className="btn-primary inline-flex items-center gap-2 text-sm">
          <PlusCircle size={18} />
          New Invoice
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card accent-indigo animate-fade-in-up-delay-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Paid</p>
              <p className="text-2xl font-bold mt-1" style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {(totalPaid / 1e18).toFixed(2)} BOT
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
        </div>

        <div className="stat-card accent-green animate-fade-in-up-delay-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Invoices</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {invoices.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <FileText size={20} style={{ color: 'var(--accent-success)' }} />
            </div>
          </div>
        </div>

        <div className="stat-card accent-amber animate-fade-in-up-delay-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Pending</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {pendingInvoices.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Clock size={20} style={{ color: 'var(--accent-warning)' }} />
            </div>
          </div>
        </div>

        <div className="stat-card accent-red animate-fade-in-up-delay-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Overdue</p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {overdueInvoices.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--accent-danger)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="animate-fade-in-up-delay-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Invoices
          </h2>
          {invoices.length > 0 && (
            <Link href="/history" className="text-sm font-medium inline-flex items-center gap-1 transition-colors"
              style={{ color: 'var(--accent-primary)' }}>
              View all
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {invoices.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
              <FileText size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No invoices yet
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              Create your first invoice to get started
            </p>
            <Link href="/create" className="btn-primary inline-flex items-center gap-2 text-sm">
              <PlusCircle size={16} />
              Create Invoice
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
