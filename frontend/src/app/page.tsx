import Link from 'next/link';
import { ArrowRight, Check, FileCheck2, FileText, Link2, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#f5f6f3]">
      <section className="page-shell grid min-h-[calc(100vh-4rem)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-semibold text-[#0f766e]">On-chain invoicing for independent work</p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Send the invoice. Keep the proof.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#56625c]">
            Invoxa records every invoice on BOT Chain, giving you and your client one verifiable payment record from issue to settlement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary px-5">Open Invoxa <ArrowRight size={17} /></Link>
            <a href="#how-it-works" className="btn-secondary px-5">How it works</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#56625c]">
            {['Wallet-based access', 'BOT Chain verification', 'No custody of funds'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check size={15} className="text-[#0f766e]" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2rem] border border-[#dfe3dc]" aria-hidden="true" />
          <div className="panel relative overflow-hidden">
            <div className="flex items-start justify-between border-b px-6 py-5" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold">Invoice INV-024</p>
                <p className="mt-1 text-xs text-[#7b8780]">Recorded on BOT Chain Testnet</p>
              </div>
              <span className="status-badge status-pending">Pending</span>
            </div>
            <div className="p-6 sm:p-8">
              <p className="eyebrow">Amount due</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">2,450.00 <span className="text-base font-medium text-[#7b8780]">BOT</span></p>
              <dl className="mt-8 divide-y border-y text-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between py-4"><dt className="text-[#7b8780]">Service</dt><dd className="font-medium">Product design</dd></div>
                <div className="flex items-center justify-between py-4"><dt className="text-[#7b8780]">Due</dt><dd className="font-medium">24 Sep 2026</dd></div>
                <div className="flex items-center justify-between py-4"><dt className="text-[#7b8780]">On-chain ID</dt><dd className="font-mono text-xs">#1842</dd></div>
              </dl>
              <div className="mt-6 flex items-center gap-3 rounded-lg bg-[#e8f5ed] px-4 py-3 text-sm font-medium text-[#16794b]">
                <ShieldCheck size={18} /> Creation transaction confirmed
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="border-y bg-white" style={{ borderColor: 'var(--border)' }}>
        <div className="page-shell py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow">The product</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A payment record both sides can verify.</h2>
            <p className="mt-4 text-base leading-7 text-[#66716b]">The invoice terms, status, and payment trail live together instead of being scattered across email, spreadsheets, and wallet history.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-[#dfe3dc] md:grid-cols-3" style={{ borderColor: 'var(--border)' }}>
            {[
              { icon: FileText, title: 'Issue with certainty', copy: 'Set the client wallet, amount, terms, and due date. The invoice is created only after the network confirms it.' },
              { icon: Link2, title: 'Share one record', copy: 'Send a direct invoice link or QR code. The client sees the same payment request you issued.' },
              { icon: FileCheck2, title: 'Retain the receipt', copy: 'Creation and payment transactions link back to the BOT Chain explorer for independent verification.' },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="bg-white p-7 sm:p-8">
                <Icon size={22} className="text-[#0f766e]" />
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#66716b]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="page-shell py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From terms to transaction in three steps.</h2>
          </div>
          <ol className="divide-y border-y" style={{ borderColor: 'var(--border)' }}>
            {[
              ['01', 'Connect your wallet', 'Your wallet identifies the issuer and will receive payment directly.'],
              ['02', 'Create the invoice', 'Review the terms, approve the transaction, and wait for BOT Chain confirmation.'],
              ['03', 'Send it to your client', 'Share the confirmed invoice link and track its payment status.'],
            ].map(([number, title, copy]) => (
              <li key={number} className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr]">
                <span className="font-mono text-sm font-semibold text-[#0f766e]">{number}</span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#66716b]">{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#17201c] text-white">
        <div className="page-shell flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to issue your first invoice?</h2><p className="mt-2 text-sm text-[#b7c0bb]">Connect a wallet and record it on BOT Chain.</p></div>
          <Link href="/create" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#17201c] transition-colors hover:bg-[#e8ebe7]">Create an invoice <ArrowRight size={17} /></Link>
        </div>
      </section>

    </div>
  );
}
