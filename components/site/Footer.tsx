import Link from "next/link";

export default function Footer(){
  return (
    <footer className="mt-24 border-t">
      <div className="container py-12 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="text-base font-semibold">Elevyn</div>
          <p className="mt-2 text-slate-600 max-w-sm">Plain-language bookkeeping with gentle AI and a dashboard that teaches.</p>
        </div>
        <div>
          <div className="font-medium">Product</div>
          <ul className="mt-2 space-y-1">
            <li><Link href="/(app)/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link href="/(app)/ledger" className="hover:underline">Ledger</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Company</div>
          <ul className="mt-2 space-y-1">
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
            <li className="text-xs text-slate-500">Educational use only.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
