import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Invoice, PaymentReceipt } from '@/utils/types';

interface InvoiceStore {
  invoices: Invoice[];
  receipts: PaymentReceipt[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addReceipt: (receipt: PaymentReceipt) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  getDraftInvoices: () => Invoice[];
  getPendingInvoices: () => Invoice[];
  getPaidInvoices: () => Invoice[];
  getOverdueInvoices: () => Invoice[];
}

export const useInvoiceStore = create<InvoiceStore>()(persist((set, get) => ({
  invoices: [],
  receipts: [],

  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [...state.invoices, invoice],
    })),

  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    })),

  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    })),

  addReceipt: (receipt) =>
    set((state) => ({
      receipts: [...state.receipts, receipt],
    })),

  getInvoiceById: (id) => {
    return get().invoices.find((inv) => inv.id === id);
  },

  getDraftInvoices: () => {
    return get().invoices.filter((inv) => inv.status === 'draft');
  },

  getPendingInvoices: () => {
    return get().invoices.filter((inv) => inv.status === 'pending');
  },

  getPaidInvoices: () => {
    return get().invoices.filter((inv) => inv.status === 'paid');
  },

  getOverdueInvoices: () => {
    const now = Date.now() / 1000;
    return get().invoices.filter(
      (inv) => inv.status !== 'paid' && inv.dueDate < now
    );
  },
}), {
  name: 'invoxa-invoices',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ invoices: state.invoices, receipts: state.receipts }),
}));
