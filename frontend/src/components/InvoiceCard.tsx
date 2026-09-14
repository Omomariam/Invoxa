import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Invoice } from '@/utils/types';
import { formatAddress, formatAmount, formatDate, isOverdue } from '@/utils/formatting';

interface InvoiceCardProps { invoice: Invoice; }

export const InvoiceCard = ({ invoice }: InvoiceCardProps) => {
  const displayStatus = isOverdue(invoice.dueDate, invoice.status) ? 'overdue' : invoice.status;

  return (
    <Link href={`/invoice/${invoice.id}`} className="panel group block p-5 transition-colors hover:border-[#aeb8ad]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{invoice.invoiceNumber}</p>
            {invoice.onChainId && <span className="rounded bg-[#e5f3f0] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0f766e]">On-chain</span>}
          </div>
          <p className="mt-1 truncate text-sm text-[#7b8780]">{invoice.description}</p>
        </div>
        <span className={`status-badge status-${displayStatus}`}>{displayStatus}</span>
      </div>

      <div className="mt-7">
        <p className="eyebrow">Amount</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{formatAmount(invoice.amount)} <span className="text-sm font-medium text-[#7b8780]">BOT</span></p>
      </div>

      <dl className="mt-6 space-y-2 border-t pt-4 text-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between gap-4"><dt className="text-[#7b8780]">Client</dt><dd className="font-mono text-xs">{formatAddress(invoice.clientAddress)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[#7b8780]">Due</dt><dd className="font-medium">{formatDate(invoice.dueDate)}</dd></div>
      </dl>

      <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[#0f766e]">
        View invoice <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
};
