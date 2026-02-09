import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-[6px] bg-[var(--text)]" />
            <span className="font-semibold">ELEVYN</span>
          </div>
          <p className="mt-3 opacity-70 max-w-[40ch]">
            Calm guidance, clear steps, and audit-ready records. No hype. Just progress.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Product</div>
          <ul className="space-y-1 opacity-80">
            <li><a href="#how">How it works</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="space-y-1 opacity-80">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8 text-xs opacity-70">
          © {new Date().getFullYear()} Elevyn, Inc.
        </div>
      </div>
    </footer>
  );
}
