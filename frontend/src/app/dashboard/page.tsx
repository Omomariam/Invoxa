'use client';

import Link from 'next/link';
import { useConnection, useConnect, useConnectors } from 'wagmi';
import { ArrowRight, FileCheck2, Loader2, Plus, Wallet } from 'lucide-react';
import { useAccountInvoices } from '@/hooks/useAccountInvoices';
import { InvoiceCard } from '@/components/InvoiceCard';
import { formatAmount } from '@/utils/formatting';

export default function Dashboard() {
  const { isConnected } = useConnection();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { invoices, loading, error, getPaidInvoices, getPendingInvoices, getOverdueInvoices } = useAccountInvoices();
  const paid = getPaidInvoices();
  const pending = getPendingInvoices();
  const overdue = getOverdueInvoices();
  const totalPaid = paid.reduce((sum, invoice) => sum + BigInt(invoice.amount), BigInt(0));

  const handleConnect = () => {
    const injected = connectors.find((connector) => connector.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  if (!isConnected) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="panel max-w-md p-8 text-center">
          <Wallet size={24} className="mx-auto text-[#56625c]" />
          <h1 className="mt-4 text-xl font-bold">Connect your wallet</h1>
          <p className="mt-2 text-sm leading-6 text-[#66716b]">Connect the wallet you use to issue invoices and receive BOT payments.</p>
          <button onClick={handleConnect} disabled={isConnecting} className="btn-primary mt-6 w-full">
            {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}{isConnecting ? 'Connecting' : 'Connect wallet'}
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Paid volume', value: `${formatAmount(totalPaid.toString())} BOT`, note: `${paid.length} settled` },
    { label: 'Awaiting payment', value: pending.length.toString(), note: 'Open invoices' },
    { label: 'Overdue', value: overdue.length.toString(), note: overdue.length ? 'Needs attention' : 'Nothing overdue' },
    { label: 'All invoices', value: invoices.length.toString(), note: 'Total created' },
  ];

  return (
    <div className="page-shell">
      {loading && <p role="status">Refreshing invoices from the blockchain...</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-sm text-[#66716b]">A current view of your invoice activity.</p>
        </div>
        <Link href="/create" className="btn-primary"><Plus size={17} /> New invoice</Link>
      </div>

      <section className="mt-8 grid overflow-hidden rounded-xl border bg-white sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: 'var(--border)' }} aria-label="Invoice totals">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`p-5 ${index ? 'border-t sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''}`} style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm text-[#66716b]">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs text-[#89938d]">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent invoices</h2>
          {invoices.length > 0 && <Link href="/history" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f766e]">View all <ArrowRight size={15} /></Link>}
        </div>
        {invoices.length === 0 ? (
          <div className="panel flex flex-col items-center px-6 py-14 text-center">
            <FileCheck2 size={24} className="text-[#7b8780]" />
            <h2 className="mt-4 font-semibold">No invoices yet</h2>
            <p className="mt-1 max-w-sm text-sm text-[#7b8780]">Create an invoice when you are ready to request payment.</p>
            <Link href="/create" className="btn-secondary mt-5"><Plus size={16} /> Create invoice</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invoices.slice(0, 6).map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
          </div>
        )}
      </section>
    </div>
  );
}
