'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { InvoiceFormData } from '@/utils/types';
import { isValidAddress } from '@/utils/formatting';
import { AlertCircle, Send, FileText } from 'lucide-react';

export default function CreateInvoice() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { addInvoice } = useInvoiceStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientAddress: '',
    description: '',
    amount: '',
    dueDate: '',
    invoiceNumber: '',
  });

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-12 text-center max-w-md mx-auto animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle size={28} style={{ color: 'var(--accent-warning)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Wallet Required
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Please connect your wallet to create an invoice
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.invoiceNumber.trim()) {
      setError('Invoice number is required');
      return;
    }

    if (!isValidAddress(formData.clientAddress)) {
      setError('Invalid client wallet address');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setLoading(true);

      const dueDate = Math.floor(new Date(formData.dueDate).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);

      if (dueDate <= now) {
        setError('Due date must be in the future');
        return;
      }

      const amount = (parseFloat(formData.amount) * 1e18).toString();

      const invoice = {
        id: `inv_${Date.now()}`,
        clientAddress: formData.clientAddress,
        description: formData.description,
        amount,
        dueDate,
        status: 'pending' as const,
        invoiceNumber: formData.invoiceNumber,
        createdAt: now,
      };

      addInvoice(invoice);

      // TODO: Call smart contract to register invoice
      // const hash = await createInvoice(
      //   formData.clientAddress,
      //   formData.description,
      //   amount,
      //   dueDate,
      //   formData.invoiceNumber
      // );

      router.push(`/invoice/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass-card-static p-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Create Invoice
            </h1>
          </div>
        </div>
        <p className="mb-8 ml-13" style={{ color: 'var(--text-muted)' }}>
          Generate a new invoice for payment on BOT Chain
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl flex gap-3"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
            <AlertCircle className="flex-shrink-0" size={20} style={{ color: 'var(--accent-danger)' }} />
            <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Invoice Number <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-001"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Client Wallet Address <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="input-field font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Web development services..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Amount (BOT) <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.001"
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Due Date <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send size={18} />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
