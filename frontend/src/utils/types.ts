export interface Invoice {
  id: string;
  onChainId?: string;
  chainId?: number;
  contractAddress?: string;
  issuerAddress?: string;
  clientAddress: string;
  description: string;
  amount: string;
  dueDate: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoiceNumber: string;
  createdAt: number;
  paidAt?: number;
  creationTransactionHash?: string;
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
