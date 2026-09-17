export function Footer() {
  return (
    <footer className="border-t bg-white" style={{ borderColor: 'var(--border)' }}>
      <div className="page-shell flex flex-col gap-4 py-7 text-sm text-[#66716b] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-[#17201c]">Invoxa</p>
        <div className="flex flex-col gap-2 sm:items-end">
          <p>Invoice records on <span className="font-semibold text-[#17201c]">BOT Chain</span>.</p>
          <nav aria-label="BOT Chain resources" className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="text-[#0f766e] underline underline-offset-4 hover:text-[#17201c]">
              botchain.ai
            </a>
            <a href="https://scan.botchain.ai" target="_blank" rel="noopener noreferrer" className="text-[#0f766e] underline underline-offset-4 hover:text-[#17201c]">
              scan.botchain.ai
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
