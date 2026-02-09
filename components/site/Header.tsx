"use client";
import Link from "next/link";

export default function Header(){
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">Elevyn</Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <a href="/#features" className="hover:opacity-80">Features</a>
          <Link href="/pricing" className="hover:opacity-80">Pricing</Link>
          <a href="/#industries" className="hover:opacity-80">Industries</a>
          <Link href="/(app)/dashboard" className="hover:opacity-80">Product</Link>
          <div className="h-5 w-px bg-slate-300" />
          <Link href="/(auth)/login" className="hover:opacity-80">Log in</Link>
          <Link href="/(auth)/signup" className="btn btn-primary">Start free</Link>
        </nav>
      </div>
    </header>
  );
}
