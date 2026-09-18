'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConnection, useConnect, useConnectors, useSwitchChain } from 'wagmi';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Copy, Download, ExternalLink, Loader2, QrCode, Share2, Wallet } from 'lucide-react';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { invoiceClient, readInvoice, readInvoiceEvents } from '@/utils/invoices';
import { DEFAULT_CHAIN, isApprovedInvoice } from '@/utils/chains';
import { useQuery } from '@tanstack/react-query';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';

type InvoiceParams = { id?: string; invoiceId?: string; contractAddress?: string };

export default function InvoiceDetail() {
  const params = useParams() as InvoiceParams;
  return <InvoiceDetailView key={`${params.id}/${params.contractAddress}/${params.invoiceId}`} params={params} />;
}

function InvoiceDetailView({ params }: { params: InvoiceParams }) {
  const id = params.invoiceId || '';
  const approved = isApprovedInvoice(params.id || '', params.contractAddress || '');
  const router = useRouter();
  const { isConnected, address } = useConnection();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const invoiceQuery = useQuery({
    queryKey: ['invoice', DEFAULT_CHAIN.id, params.contractAddress, id],
    queryFn: () => readInvoice(id),
    enabled: approved,
    refetchInterval: 30000,
  });
  const [events, setEvents] = useState<{ creationTransactionHash?: string; transactionHash?: string }>({});
  const invoice = invoiceQuery.data ? { ...invoiceQuery.data, ...events } : null;
  const [readError, setReadError] = useState<string | null>(null);
  const reading = approved && invoiceQuery.isPending;
  const [paymentReceipt, setPaymentReceipt] = useState<{ amount: string; value: string; refund: string; gas: string } | null>(null);
  const [cursor, setCursor] = useState<bigint | undefined>();
  const [eventsDone, setEventsDone] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const { payInvoiceOnChain, cancelInvoiceOnChain, loading, error, transactionHash } = useInvoiceContract();
  const { mutateAsync: switchNetworkAsync } = useSwitchChain();
  const act = async (action: 'pay' | 'cancel') => {
    if (!invoice) return;
    setReadError(null);
    try {
      if (switchNetworkAsync) await switchNetworkAsync({ chainId: DEFAULT_CHAIN.id });
      const hash = action === 'pay' ? await payInvoiceOnChain(BigInt(id)) : await cancelInvoiceOnChain(BigInt(id));
      if (hash) {
        await invoiceQuery.refetch();
        if (action === 'pay') {
          const [tx, receipt, settled] = await Promise.all([invoiceClient.getTransaction({ hash }), invoiceClient.getTransactionReceipt({ hash }), readInvoice(id)]);
          setPaymentReceipt({ amount: settled.amount, value: tx.value.toString(), refund: (tx.value - BigInt(settled.amount)).toString(), gas: (receipt.gasUsed * receipt.effectiveGasPrice).toString() });
        }
      }
    } catch (error) { setReadError(error instanceof Error ? error.message : 'Transaction failed.'); }
  };
  const loadEvents = async () => {
    setEventLoading(true); setReadError(null);
    try {
      const result = await readInvoiceEvents(id, cursor);
      setEvents(value => ({ ...value, creationTransactionHash: result.creationHash || value.creationTransactionHash, transactionHash: result.paymentHash || value.transactionHash }));
      setCursor(result.next); setEventsDone(result.next === undefined);
    } catch (error) { setReadError(error instanceof Error ? error.message : 'Could not load events.'); }
    finally { setEventLoading(false); }
  };
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleConnect = () => {
    const injected = connectors.find((connector) => connector.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  if (reading) return <div className="page-shell" role="status">Loading invoice from {DEFAULT_CHAIN.name}...</div>;

  if (!invoice) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="panel max-w-md p-8 text-center">
          <AlertCircle size={24} className="mx-auto text-[#b42318]" />
          <h1 className="mt-4 text-xl font-bold">Invoice not found</h1>
          <p className="mt-2 text-sm leading-6 text-[#66716b]">{!approved ? "This link does not identify the configured network and approved contract. Open a current invoice link from history." : invoiceQuery.error?.message || readError || "The invoice may not exist."}</p>
          <button onClick={() => router.push('/history')} className="btn-secondary mt-6"><ArrowLeft size={16} /> Back to invoices</button>
        </div>
      </div>
    );
  }

  const displayStatus = isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status;
  const invoiceUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text: `${formatAmount(invoice.amount)} BOT`, url: invoiceUrl });
    } else {
      await handleCopyLink();
    }
  };

  return (
    <div className="page-shell max-w-5xl">
      <div className="no-print mb-5 flex items-center justify-between">
        <button onClick={() => router.back()} className="btn-ghost -ml-3 px-3"><ArrowLeft size={16} /> Back</button>
        <div className="flex gap-2">
          <button onClick={handleShare} className="btn-secondary px-3 sm:px-4"><Share2 size={16} /><span className="hidden sm:inline">Share</span></button>
          <button onClick={() => window.print()} className="btn-secondary px-3 sm:px-4"><Download size={16} /><span className="hidden sm:inline">Print / PDF</span></button>
        </div>
      </div>

      <article className="panel overflow-hidden">
        <header className="flex flex-col justify-between gap-5 border-b px-5 py-6 sm:flex-row sm:items-start sm:px-8" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="eyebrow">Invoice</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{invoice.invoiceNumber}</h1>
            <p className="mt-2 text-sm text-[#66716b]">Issued {formatDate(invoice.createdAt)}</p>
          </div>
          <span className={`status-badge status-${displayStatus}`}>{displayStatus}</span>
        </header>

        {displayStatus === 'overdue' && (
          <div className="flex items-center gap-3 border-b bg-[#fdefec] px-5 py-3 text-sm text-[#b42318] sm:px-8" style={{ borderColor: '#efc7c2' }}>
            <AlertCircle size={17} /> Payment was due {formatDate(invoice.dueDate)}.
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_20rem]">
          <div className="p-5 sm:p-8 lg:border-r" style={{ borderColor: 'var(--border)' }}>
            <section>
              <p className="eyebrow">Amount due</p>
              <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{formatAmount(invoice.amount)} <span className="text-lg font-medium text-[#7b8780]">BOT</span></p>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold">Invoice details</h2>
              <dl className="mt-3 divide-y border-y text-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-[#7b8780]">Description</dt><dd className="whitespace-pre-wrap font-medium">{invoice.description}</dd></div>
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-[#7b8780]">Issuer</dt><dd className="break-all font-mono text-xs">{invoice.issuerAddress || address || '—'}</dd></div>
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-[#7b8780]">Client</dt><dd className="break-all font-mono text-xs">{invoice.clientAddress}</dd></div>
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-[#7b8780]">Due date</dt><dd className="font-medium">{formatDate(invoice.dueDate)}</dd></div>
                {invoice.paidAt && <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]"><dt className="text-[#7b8780]">Paid</dt><dd className="font-medium text-[#16794b]">{formatDate(invoice.paidAt)}</dd></div>}
              </dl>
            </section>

            {invoice.onChainId && invoice.creationTransactionHash && (
              <section className="mt-8 rounded-lg border border-[#bcdcc9] bg-[#f2faf5] p-5">
                <h2 className="flex items-center gap-2 font-semibold text-[#16794b]"><CheckCircle2 size={18} /> Recorded on BOT Chain</h2>
                <p className="mt-2 text-sm text-[#56625c]">Contract invoice #{invoice.onChainId} on {DEFAULT_CHAIN.name}.</p>
                <a href={`${DEFAULT_CHAIN.blockExplorers.default.url}/tx/${invoice.creationTransactionHash}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0f766e]">View creation transaction <ExternalLink size={13} /></a>
              </section>
            )}

            {invoice.status === 'paid' && (
              <section className="mt-8 rounded-lg border border-[#bcdcc9] bg-[#f2faf5] p-5">
                <h2 className="flex items-center gap-2 font-semibold text-[#16794b]"><CheckCircle2 size={18} /> Payment recorded</h2>
                <p className="mt-2 text-sm text-[#56625c]">{formatAmount(invoice.amount)} BOT received{invoice.paidAt ? ` on ${formatDate(invoice.paidAt)}` : ''}.</p>
                {invoice.transactionHash && <a href={`${DEFAULT_CHAIN.blockExplorers.default.url}/tx/${invoice.transactionHash}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#0f766e]">{formatAddress(invoice.transactionHash)} <ExternalLink size={13} /></a>}
              </section>
            )}
          </div>

          <aside className="border-t bg-[#fafbf9] p-5 sm:p-8 lg:border-t-0">
            <h2 className="text-sm font-semibold">Payment link</h2>
            <p className="mt-1 text-xs leading-5 text-[#7b8780]">Send this link to the client named on the invoice.</p>
            <button onClick={handleCopyLink} className="btn-secondary no-print mt-4 w-full">
              {copied ? <Check size={16} className="text-[#16794b]" /> : <Copy size={16} />}{copied ? 'Link copied' : 'Copy payment link'}
            </button>

            <button onClick={() => setShowQR((visible) => !visible)} className="btn-ghost no-print mt-2 w-full"><QrCode size={16} />{showQR ? 'Hide QR code' : 'Show QR code'}</button>
            {showQR && <div className="mt-4 flex justify-center rounded-lg border bg-white p-4" style={{ borderColor: 'var(--border)' }}><QRCodeSVG value={invoiceUrl} size={176} level="M" /></div>}

            <div className="no-print mt-8 border-t pt-6">
              {(readError || error) && <p role="alert" className="text-sm text-red-700">{readError || error}</p>}
              {!isConnected && invoice.status === 'pending' && <button onClick={handleConnect} disabled={isConnecting} className="btn-primary mt-4 w-full">Connect wallet to pay</button>}
              {isConnected && invoice.status === 'pending' && address?.toLowerCase() === invoice.clientAddress.toLowerCase() && <button onClick={() => act('pay')} disabled={loading} className="btn-success mt-4 w-full">{loading ? 'Confirming transaction...' : `Pay ${formatAmount(invoice.amount)} BOT`}</button>}
              {isConnected && invoice.status === 'pending' && address?.toLowerCase() === invoice.issuerAddress?.toLowerCase() && <button onClick={() => act('cancel')} disabled={loading} className="btn-secondary mt-4 w-full">Cancel invoice</button>}
              {paymentReceipt && <dl className="mt-4 text-xs"><dt>Invoice settled</dt><dd>{formatAmount(paymentReceipt.amount)} BOT</dd><dt>Transaction value</dt><dd>{formatAmount(paymentReceipt.value)} BOT</dd><dt>Excess refunded</dt><dd>{formatAmount(paymentReceipt.refund)} BOT</dd><dt>Gas fee</dt><dd>{formatAmount(paymentReceipt.gas)} BOT</dd></dl>}
              <p className="mt-3 text-xs text-[#7b8780]">Only the named client can pay. The client pays network gas separately. Payment status is read from the contract.</p>
              {transactionHash && <a href={`${DEFAULT_CHAIN.blockExplorers.default.url}/tx/${transactionHash}`} target="_blank" rel="noreferrer" className="mt-3 block text-xs underline">View submitted transaction</a>}
              <button onClick={() => invoiceQuery.refetch()} disabled={loading} className="btn-ghost mt-3 w-full">Refresh contract status</button>
              <button onClick={loadEvents} disabled={eventLoading || eventsDone} className="btn-ghost mt-2 w-full">{eventLoading ? 'Searching events...' : eventsDone ? 'Event search complete' : cursor ? 'Continue transaction lookup' : 'Load transaction links'}</button>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
