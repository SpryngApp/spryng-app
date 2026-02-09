// components/marketing/HeaderNav.tsx
"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type NavItem = {
  label: string;
  href: string;
};

export default function HeaderNav({
  brand = "SPRYNG",
  items = [
    { label: "How it works", href: "#how" },
    { label: "What you get", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Resources", href: "/resources" },
  ],
}: {
  brand?: string;
  items?: NavItem[];
}) {
  // Use rgb(var(--brand)) safely (your design tokens store channels in --brand)
  const BRAND_BG = "bg-[color:rgb(var(--brand))]";
  const BRAND_TEXT = "text-[color:rgb(var(--brand))]";

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b bg-white/80 backdrop-blur",
        isScrolled ? "border-neutral-200" : "border-neutral-200/60"
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2">
          <div className="relative h-7 w-7 overflow-hidden rounded-md border border-neutral-200 bg-white">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--brand)),transparent_60%)] opacity-70" />
            <div className={cx("absolute left-1.5 top-1.5 h-2 w-2 rounded-full", BRAND_BG)} />
          </div>
          <span className="font-heading text-sm tracking-wide">{brand}</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm text-neutral-700 md:flex">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className="hover:text-black transition-colors"
            >
              {it.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <a
            href="/quiz"
            className="btn btn-ghost h-9"
            aria-label="Run readiness quiz"
          >
            Run readiness quiz
          </a>
          <a href="/signup" className="btn btn-primary h-9" aria-label="Start free">
            Start free
          </a>
        </div>
      </div>

      {/* Optional: subtle top accent line when scrolled (feels premium) */}
      <div
        aria-hidden
        className={cx(
          "h-[1px] w-full transition-opacity",
          isScrolled ? "opacity-100" : "opacity-0"
        )}
      >
        <div className={cx("h-full w-full opacity-30", BRAND_BG)} />
      </div>
    </header>
  );
}
