'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useConnect, useConnectors, useSwitchChain } from 'wagmi';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { useInvoiceContract } from '@/hooks/useInvoiceContract';
import { DEFAULT_CHAIN, invoiceUrl } from '@/utils/chains';
import { InvoiceFormData } from '@/utils/types';
import { isValidAddress, parseAmount } from '@/utils/formatting';

export default function CreateInvoice() {
  const router = useRouter();
  const { address, isConnected } = useConnection();
  const { mutate: connect, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { chainId } = useConnection();
  const { mutateAsync: switchNetworkAsync } = useSwitchChain();
  const { createInvoiceOnChain, loading: contractLoading, error: contractError, transactionHash } = useInvoiceContract();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({ clientAddress: '', description: '', amount: '', dueDate: '', invoiceNumber: '' });

  const handleConnect = () => {
    const injected = connectors.find((connector) => connector.id === 'injected') || connectors[0];
    if (injected) connect({ connector: injected });
  };

  if (!isConnected) {
    return (
      <div className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="panel max-w-md p-8 text-center">
          <Wallet size={24} className="mx-auto text-[#56625c]" />
          <h1 className="mt-4 text-xl font-bold">Connect a wallet to continue</h1>
          <p className="mt-2 text-sm leading-6 text-[#66716b]">Your wallet identifies the invoice issuer and receives the payment.</p>
          <button onClick={handleConnect} disabled={isConnecting} className="btn-primary mt-6 w-full">
            {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
            {isConnecting ? 'Connecting' : 'Connect wallet'}
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!formData.invoiceNumber.trim()) return setError('Enter an invoice number.');
    if (!isValidAddress(formData.clientAddress)) return setError('Enter a valid client wallet address.');
    if (!formData.description.trim()) return setError('Enter a description.');
    if (!formData.amount || parseFloat(formData.amount) <= 0) return setError('Enter an amount greater than zero.');
    if (!formData.dueDate) return setError('Choose a due date.');

    try {
      setLoading(true);
      const dueDate = Math.floor(new Date(`${formData.dueDate}T23:59:59`).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      if (dueDate <= now) return setError('Choose a future due date.');

      if (chainId !== DEFAULT_CHAIN.id) {
        if (!switchNetworkAsync) throw new Error('Switch your wallet to the configured BOT Chain network and try again.');
        await switchNetworkAsync({ chainId: DEFAULT_CHAIN.id });
      }

      const amount = parseAmount(formData.amount);
      const result = await createInvoiceOnChain(
        formData.clientAddress,
        formData.description.trim(),
        amount,
        dueDate,
        formData.invoiceNumber.trim()
      );
      if (!result) return;

      router.push(invoiceUrl(result.invoiceId.toString()));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'The invoice could not be created.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-shell max-w-3xl">
      <button onClick={() => router.back()} className="btn-ghost -ml-3 mb-5 px-3"><ArrowLeft size={16} /> Back</button>
      <div className="mb-8">
        <p className="eyebrow">Payment request</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">New invoice</h1>
        <p className="mt-2 text-sm text-[#66716b]">Enter the payment details exactly as your client should see them.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel">
        <div className="space-y-6 p-5 sm:p-8">
          {(error || contractError) && (
            <div role="alert" className="flex gap-3 rounded-lg border border-[#efc7c2] bg-[#fdefec] p-4 text-sm text-[#b42318]">
              <AlertCircle size={18} className="mt-0.5 shrink-0" /> <span>{error || contractError}</span>
            </div>
          )}

          <div className="flex gap-3 rounded-lg border border-[#bcdcc9] bg-[#f2faf5] p-4 text-sm text-[#315d45]">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>This invoice will be written to {DEFAULT_CHAIN.name}. Descriptions and invoice numbers are public and permanent. Your wallet will ask you to approve the network transaction and fee.</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="invoiceNumber" className="field-label">Invoice number</label>
              <input id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} placeholder="INV-001" className="input-field" autoComplete="off" required />
              <p className="field-hint">Use your existing numbering convention.</p>
            </div>
            <div>
              <label htmlFor="dueDate" className="field-label">Due date</label>
              <input id="dueDate" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} min={today} className="input-field" required />
            </div>
          </div>

          <div>
            <label htmlFor="clientAddress" className="field-label">Client wallet address</label>
            <input id="clientAddress" name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="0x0000..." className="input-field font-mono" spellCheck={false} required />
            <p className="field-hint">Payments from this invoice will be associated with this address.</p>
          </div>

          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="What is this invoice for?" rows={4} className="input-field resize-y" required />
          </div>

          <div className="max-w-xs">
            <label htmlFor="amount" className="field-label">Amount</label>
            <div className="relative">
              <input id="amount" type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" step="0.001" min="0.001" className="input-field pr-14 tabular-nums" required />
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-semibold text-[#66716b]">BOT</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t bg-[#fafbf9] px-5 py-4 sm:flex-row sm:justify-end sm:px-8" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading || contractLoading} className="btn-primary min-w-44">
            {(loading || contractLoading) && <Loader2 size={16} className="animate-spin" />}
            {contractLoading ? (transactionHash ? 'Confirming on-chain' : 'Confirm in wallet') : loading ? 'Preparing' : 'Create on-chain invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
