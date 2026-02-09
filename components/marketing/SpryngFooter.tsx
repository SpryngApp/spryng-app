// components/marketing/SpryngFooter.tsx
"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

type FooterLink = { label: string; href: string };
type FooterCol = { title: string; links: FooterLink[] };

const FOOTER_COLUMNS: FooterCol[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Customers", href: "/customers" },
      { label: "Help center", href: "/help" },
      { label: "Product updates", href: "/updates" },
      { label: "Security", href: "/security" },
      { label: "API documentation", href: "/docs" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Employer setup", href: "/product/employer-setup" },
      { label: "UI deadlines + reminders", href: "/product/reminders" },
      { label: "Proof + records", href: "/product/proof" },
      { label: "Audit-ready exports", href: "/product/exports" },
      { label: "Payee tracking (Pro)", href: "/product/payees" },
      { label: "Integrations (coming soon)", href: "/integrations" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "What you get", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Readiness quiz", href: "/quiz" },
      { label: "Templates", href: "/resources/templates" },
      { label: "Guides", href: "/resources/guides" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Accounting firms", href: "/partners/accountants" },
      { label: "Bookkeepers", href: "/partners/bookkeepers" },
      { label: "Payroll providers", href: "/partners/payroll" },
      { label: "Advisors", href: "/partners/advisors" },
      { label: "Become a partner", href: "/partners/apply" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Startups", href: "/solutions/startups" },
      { label: "Small business", href: "/solutions/smb" },
      { label: "Growing teams", href: "/solutions/growth" },
      { label: "Multi-state", href: "/solutions/multi-state" },
      { label: "Service businesses", href: "/solutions/services" },
    ],
  },
  {
    title: "Free tools & resources",
    links: [
      { label: "State employer checklist", href: "/resources/employer-checklist" },
      { label: "UI deadline tracker", href: "/resources/ui-deadlines" },
      { label: "Audit readiness basics", href: "/resources/audit-readiness" },
      { label: "Proof request templates", href: "/resources/proof-templates" },
      { label: "Glossary (plain English)", href: "/resources/glossary" },
      { label: "Resource hub", href: "/resources" },
    ],
  },
];

function BrandMark() {
  const BRAND_BG = "bg-[color:rgb(var(--brand))]";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--brand)),transparent_60%)] opacity-70" />
        <div className={cx("absolute left-2 top-2 h-2 w-2 rounded-full", BRAND_BG)} />
      </div>
      <div className="leading-none">
        <div className="font-heading text-sm tracking-wide text-white">SPRYNG</div>
        <div className="mt-1 text-xs text-white/60">State-ready employer setup</div>
      </div>
    </div>
  );
}

export default function SpryngFooter({
  columns = FOOTER_COLUMNS,
  showLegal = true,
}: {
  columns?: FooterCol[];
  showLegal?: boolean;
}) {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 text-white">
      {/* Top area */}
      <div className="container py-14">
        {/* Optional: brand + short blurb row */}
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <BrandMark />
          <div className="max-w-xl text-sm text-white/70">
            Calm, state-specific guidance for employer setup—plus reminders and clean records you
            can stand behind.
          </div>
        </div>

        {/* Link grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-sm font-semibold text-white">{col.title}</div>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/65 hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        {showLegal && (
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} SPRYNG. All rights reserved.</div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="/security" className="hover:text-white transition-colors">
                Security
              </a>
              <a href="/contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
