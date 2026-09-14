export interface Invoice {
  id: string;
  clientAddress: string;
  description: string;
  amount: string;
  dueDate: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
  createdAt: number;
  paidAt?: number;
  transactionHash?: string;
}

export interface PaymentReceipt {
  invoiceId: string;
  transactionHash: string;
  amount: string;
  paidAt: number;
  paidBy: string;
}

export interface InvoiceFormData {
  clientAddress: string;
  description: string;
  amount: string;
  dueDate: string;
  invoiceNumber: string;
}
