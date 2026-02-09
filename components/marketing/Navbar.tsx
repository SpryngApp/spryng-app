"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--line)]">
      <nav className="e-container h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-[15px]">ELEVYN</Link>

        <div className="hidden md:flex items-center gap-20">
          <div className="flex gap-16 text-[14px]">
            <a href="#how" className="e-link">How it works</a>
            <a href="#features" className="e-link">Features</a>
            <a href="#pricing" className="e-link">Pricing</a>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/quiz" className="e-btn e-btn-ghost">Run readiness quiz</Link>
          <Link href="/signup" className="e-btn e-btn-primary">Start free</Link>
        </div>
      </nav>
    </header>
  );
}
