'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { InvoiceFormData } from '@/utils/types';
import { isValidAddress } from '@/utils/formatting';
import { AlertCircle } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-gray-600">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Invoice</h1>
        <p className="text-gray-600 mb-8">
          Generate a new invoice for payment on BOT Chain
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Invoice Number *
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-2024-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Client Wallet Address *
            </label>
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              The wallet address that will receive the payment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Development services for Q1 2024"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Amount (BOT) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
