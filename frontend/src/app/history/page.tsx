'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useConnection, useConnect, useConnectors } from 'wagmi';
import { FileText, Loader2, Plus, Search, Wallet } from 'lucide-react';
import { useAccountInvoices } from '@/hooks/useAccountInvoices';
import { InvoiceCard } from '@/components/InvoiceCard';
import { isOverdue } from '@/utils/formatting';

const filters = ['all', 'pending', 'paid', 'overdue', 'cancelled'] as const;
type Filter = typeof filters[number];

export default function History() {
  const { isConnected } = useConnection();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { invoices, loading, error } = useAccountInvoices();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const visibleInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const status = isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status;
      const matchesFilter = filter === 'all' || status === filter;
      const matchesQuery = !normalizedQuery || [invoice.invoiceNumber, invoice.description, invoice.clientAddress].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [filter, invoices, query]);

  const handleConnect = () => {
    const injected = connectors.find((connector) => connector.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  if (!isConnected) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="panel max-w-md p-8 text-center">
          <Wallet size={24} className="mx-auto text-[#56625c]" />
          <h1 className="mt-4 text-xl font-bold">Connect a wallet to view invoices</h1>
          <p className="mt-2 text-sm leading-6 text-[#66716b]">Invoice history is loaded for the currently connected address.</p>
          <button onClick={handleConnect} disabled={isConnecting} className="btn-primary mt-6 w-full">
            {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
            {isConnecting ? 'Connecting' : 'Connect wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {loading && <p role="status">Refreshing invoices from the blockchain...</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Records</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="mt-2 text-sm text-[#66716b]">{invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} in this wallet.</p>
        </div>
        <Link href="/create" className="btn-primary"><Plus size={17} /> New invoice</Link>
      </div>

      {invoices.length === 0 ? (
        <div className="panel mt-8 flex flex-col items-center px-6 py-16 text-center">
          <FileText size={25} className="text-[#7b8780]" />
          <h2 className="mt-4 font-semibold">No invoices found</h2>
          <p className="mt-1 max-w-sm text-sm text-[#7b8780]">Invoices created from this wallet will appear here.</p>
          <Link href="/create" className="btn-secondary mt-5"><Plus size={16} /> Create invoice</Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Filter invoices">
              {filters.map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${filter === item ? 'bg-[#17201c] text-white' : 'text-[#66716b] hover:bg-white'}`}>{item}</button>
              ))}
            </div>
            <label className="relative block sm:w-64">
              <span className="sr-only">Search invoices</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8780]" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoices" className="input-field pl-9" />
            </label>
          </div>

          {visibleInvoices.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleInvoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-medium">No matching invoices</p>
              <p className="mt-1 text-sm text-[#7b8780]">Try a different search or status.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
