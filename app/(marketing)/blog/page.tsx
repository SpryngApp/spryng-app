// app/blog/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";

/**
 * Spryng — Blog / Resource Center (SaaS-grade, Tailor Brands-style)
 * -----------------------------------------------------------------
 * Goals:
 * - Content-hub look/feel (category nav + editorial sections w/ image cards)
 * - Clear hierarchy, intentional spacing, premium “standard SaaS” polish
 * - Still keeps Spryng differentiator: state + audit-ready records
 *
 * Notes:
 * - Uses <img> (not next/image) to avoid remote domain config during early stages.
 * - Replace POSTS with CMS/MDX later; UI stays the same.
 */

type Category =
  | "Employer Setup"
  | "Audit-Ready Records"
  | "State Guides"
  | "Paying Helpers"
  | "Templates"
  | "Product Updates"
  | "Stories";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  state?: string; // e.g., "IN"
  minutes: number;
  publishedAt: string; // YYYY-MM-DD
  updatedAt?: string; // YYYY-MM-DD
  coverUrl?: string;
  featured?: boolean;
  editorPick?: boolean;
  startHere?: boolean;
};

const BRAND = "rgb(var(--brand))";
const BRAND_SOFT = "rgb(var(--brand-soft) / 0.22)";
const BRAND_BORDER = "rgb(var(--brand) / 0.14)";

const STATES = [
  { code: "ALL", name: "All states" },
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const TOPICS: Array<{
  key: Category;
  label: string;
  blurb: string;
}> = [
  {
    key: "Employer Setup",
    label: "Employer Setup",
    blurb: "State registrations, accounts, and the minimum setup that holds up under review.",
  },
  {
    key: "Audit-Ready Records",
    label: "Audit-Ready Records",
    blurb: "What to keep, how to label it, and how to stay defensible without the chaos.",
  },
  {
    key: "State Guides",
    label: "State Guides",
    blurb: "State-by-state instructions, portals, and “what the state actually wants.”",
  },
  {
    key: "Paying Helpers",
    label: "Paying Helpers",
    blurb: "Documentation that makes outside-payroll payments less risky and more organized.",
  },
  {
    key: "Templates",
    label: "Templates",
    blurb: "Copy/paste emails, checklists, and operational templates you’ll actually use.",
  },
  {
    key: "Product Updates",
    label: "Product Updates",
    blurb: "What’s new in Spryng—shipping improvements that save time and reduce errors.",
  },
  {
    key: "Stories",
    label: "Stories",
    blurb: "Customer wins, real workflows, and what changed after getting employer-ready.",
  },
];

// Demo content (swap with CMS/MDX later)
const POSTS: Post[] = [
  // Employer Setup
  {
    slug: "start-here-employer-setup-roadmap",
    title: "Start here: the simplest employer setup roadmap",
    excerpt:
      "A calm, step-by-step flow to register as an employer in your state and set up the accounts you’ll actually need.",
    category: "Employer Setup",
    minutes: 8,
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    featured: true,
    startHere: true,
    editorPick: true,
    coverUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "the-4-state-accounts-most-owners-miss",
    title: "The 4 state accounts most small business owners miss",
    excerpt:
      "Unemployment, withholding, new hire reporting, and the portal you didn’t know you needed—mapped in plain English.",
    category: "Employer Setup",
    minutes: 6,
    publishedAt: "2026-01-22",
    startHere: true,
    editorPick: true,
    coverUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "when-you-need-to-register-as-an-employer",
    title: "Do I need to register as an employer in my state?",
    excerpt:
      "A practical decision guide: common triggers, typical timelines, and how to avoid the most painful mistakes.",
    category: "Employer Setup",
    minutes: 7,
    publishedAt: "2026-02-04",
    coverUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=70",
  },

  // Audit-Ready Records
  {
    slug: "audit-ready-records-minimum-system",
    title: "Audit-ready records: the minimum system that works",
    excerpt:
      "What to keep, how to label it, and how to avoid the ‘we can’t find it’ panic when a notice arrives.",
    category: "Audit-Ready Records",
    minutes: 7,
    publishedAt: "2026-01-28",
    editorPick: true,
    startHere: true,
    coverUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "what-to-do-when-you-get-a-state-notice",
    title: "What to do when you get a state notice (calm response plan)",
    excerpt:
      "A fast triage framework: what the notice is asking, what to gather, and how to respond without spiraling.",
    category: "Audit-Ready Records",
    minutes: 8,
    publishedAt: "2026-01-26",
    coverUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "record-retention-what-to-keep-and-how-long",
    title: "Record retention: what to keep, how long, and how to store it",
    excerpt:
      "A simple retention map for employer records + outside-payroll documentation—organized so you can export cleanly.",
    category: "Audit-Ready Records",
    minutes: 9,
    publishedAt: "2026-02-06",
    coverUrl:
      "https://images.unsplash.com/photo-1586282023692-05b8adf03b62?auto=format&fit=crop&w=1600&q=70",
  },

  // State Guides
  {
    slug: "indiana-employer-registration-step-by-step",
    title: "Indiana employer registration: step-by-step setup",
    excerpt:
      "A guided walkthrough of registration, key portals, and the records to keep so you’re audit-ready from day one.",
    category: "State Guides",
    state: "IN",
    minutes: 10,
    publishedAt: "2026-01-10",
    updatedAt: "2026-01-30",
    featured: true,
    coverUrl:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "california-employer-registration-step-by-step",
    title: "California employer registration: accounts + portals to know",
    excerpt:
      "Where to register, what you’ll be asked for, and how to set up a recordkeeping system that scales.",
    category: "State Guides",
    state: "CA",
    minutes: 11,
    publishedAt: "2026-02-03",
    coverUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "texas-employer-registration-step-by-step",
    title: "Texas employer registration: the practical setup checklist",
    excerpt:
      "A clean checklist view—what to do first, what can wait, and what to keep for audit-ready continuity.",
    category: "State Guides",
    state: "TX",
    minutes: 10,
    publishedAt: "2026-02-07",
    coverUrl:
      "https://images.unsplash.com/photo-1523289333742-be1143f6b766?auto=format&fit=crop&w=1600&q=70",
  },

  // Paying Helpers
  {
    slug: "paying-helpers-outside-payroll-documentation",
    title: "Paying helpers outside payroll: what documentation you need",
    excerpt:
      "A defensible documentation checklist—before you pay, not after. Built for speed and clarity.",
    category: "Paying Helpers",
    minutes: 9,
    publishedAt: "2026-02-02",
    startHere: true,
    coverUrl:
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "cash-app-and-zelle-payments-how-to-stay-clean",
    title: "Cash App / Zelle payments: how to stay clean and trackable",
    excerpt:
      "How to keep payment proof tidy—memos, screenshots, invoices, and what to standardize going forward.",
    category: "Paying Helpers",
    minutes: 8,
    publishedAt: "2026-02-08",
    coverUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "contractor-file-checklist-what-to-collect",
    title: "Contractor file checklist: what to collect before you pay",
    excerpt:
      "A clean checklist for W-9s, invoices, COIs, licenses, and how to request missing items without tension.",
    category: "Paying Helpers",
    minutes: 7,
    publishedAt: "2026-02-10",
    coverUrl:
      "https://images.unsplash.com/photo-1554224155-b16b8d2f3f5b?auto=format&fit=crop&w=1600&q=70",
  },

  // Templates
  {
    slug: "template-proof-request-email",
    title: "Template: the exact email to request missing documentation",
    excerpt:
      "Copy/paste scripts that keep relationships intact while you collect what you need for clean records.",
    category: "Templates",
    minutes: 4,
    publishedAt: "2026-01-18",
    editorPick: true,
    coverUrl:
      "https://images.unsplash.com/photo-1554774853-b414d2a2b7b0?auto=format&fit=crop&w=1600&q=70",
  },
  {
    slug: "template-employer-onboarding-checklist",
    title: "Template: employer onboarding checklist (first 30 days)",
    excerpt:
      "A lightweight checklist that prevents missed steps when you hire—and keeps your records consistent.",
    category: "Templates",
    minutes: 5,
    publishedAt: "2026-02-05",
    coverUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=70",
  },

  // Product Updates
  {
    slug: "spryng-release-notes-january",
    title: "Product updates: faster employer setup + cleaner records",
    excerpt:
      "What’s new in Spryng—quality-of-life improvements that make registration and documentation feel lighter.",
    category: "Product Updates",
    minutes: 5,
    publishedAt: "2026-01-31",
    coverUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=70",
  },

  // Stories
  {
    slug: "story-from-overwhelm-to-employer-ready",
    title: "From overwhelm to employer-ready in 10 days: what changed",
    excerpt:
      "A real workflow story: how a small business owner went from scattered steps to audit-ready consistency.",
    category: "Stories",
    minutes: 6,
    publishedAt: "2026-02-09",
    coverUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=70",
  },
];

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function toId(label: string) {
  return label.toLowerCase().replace(/[^\w]+/g, "-");
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isMatch(haystack: string, needle: string) {
  if (!needle.trim()) return true;
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "brand"
          ? "text-slate-900"
          : "bg-slate-100 text-slate-700"
      )}
      style={tone === "brand" ? { background: BRAND_SOFT, border: `1px solid ${BRAND_BORDER}` } : undefined}
    >
      {children}
    </span>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {children}
    </div>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <CardShell>
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Pill tone="brand">{post.category}</Pill>
            {post.state ? <Pill>{post.state}</Pill> : null}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {post.updatedAt ? (
                <span>Updated {formatDate(post.updatedAt)}</span>
              ) : (
                <span>Published {formatDate(post.publishedAt)}</span>
              )}
            </div>
            <div className="text-xs text-slate-500">{post.minutes} min</div>
          </div>

          <h3 className="mt-2 text-base font-semibold leading-snug text-slate-900 group-hover:underline">
            {post.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </CardShell>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/blog/${post.slug}`} className="group grid gap-0 lg:grid-cols-2">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[280px]">
          {post.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Pill tone="brand">Featured</Pill>
            <Pill>{post.category}</Pill>
            {post.state ? <Pill>{post.state}</Pill> : null}
          </div>
        </div>

        <div className="flex flex-col justify-between p-7">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 group-hover:underline">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>
              {post.minutes} min • {post.updatedAt ? `Updated ${formatDate(post.updatedAt)}` : `Published ${formatDate(post.publishedAt)}`}
            </span>
            <span className="font-semibold text-slate-900">Read →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function SubscribePanel() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("idle");
    try {
      // wire later
      await new Promise((r) => setTimeout(r, 350));
      setEmail("");
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Get the best Spryng guides</h3>
          <p className="mt-1 text-sm text-slate-600">
            State setup + audit-ready recordkeeping templates. No fluff.
          </p>
        </div>
        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: BRAND_SOFT, border: `1px solid ${BRAND_BORDER}` }}>
          Newsletter
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-2">
        <label className="sr-only" htmlFor="newsletterEmail">
          Email
        </label>
        <input
          id="newsletterEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="you@business.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />

        <button
          type="submit"
          disabled={busy}
          className={cx(
            "w-full rounded-xl px-3 py-2 text-sm font-semibold text-white transition",
            busy ? "cursor-not-allowed bg-slate-300" : "bg-slate-900 hover:bg-slate-800"
          )}
        >
          {busy ? "Subscribing…" : "Subscribe"}
        </button>

        {status === "ok" ? <p className="text-xs text-emerald-700">Subscribed. Welcome.</p> : null}
        {status === "err" ? <p className="text-xs text-rose-700">Something went wrong. Try again.</p> : null}
      </form>
    </div>
  );
}

export default function BlogIndexPage() {
  const [query, setQuery] = React.useState("");
  const [stateCode, setStateCode] = React.useState<string>("ALL");
  const [activeTopic, setActiveTopic] = React.useState<Category>("Employer Setup");

  const featured = React.useMemo(() => POSTS.find((p) => p.featured) || POSTS[0], []);
  const startHere = React.useMemo(() => POSTS.filter((p) => p.startHere).slice(0, 4), []);
  const stateLabel = STATES.find((s) => s.code === stateCode)?.name ?? "All states";

  const filteredByControls = React.useMemo(() => {
    return POSTS.filter((p) => {
      if (stateCode !== "ALL" && p.state !== stateCode) return false;
      if (query.trim()) {
        const blob = `${p.title} ${p.excerpt} ${p.category} ${p.state ?? ""}`;
        if (!isMatch(blob, query)) return false;
      }
      return true;
    });
  }, [query, stateCode]);

  const postsByTopic = React.useMemo(() => {
    const map = new Map<Category, Post[]>();
    TOPICS.forEach((t) => map.set(t.key, []));
    filteredByControls.forEach((p) => {
      map.set(p.category, [...(map.get(p.category) || []), p]);
    });
    // sort newest first (use updatedAt if present)
    (Array.from(map.keys()) as Category[]).forEach((k) => {
      map.set(
        k,
        (map.get(k) || []).sort((a, b) => {
          const ad = (a.updatedAt || a.publishedAt);
          const bd = (b.updatedAt || b.publishedAt);
          return bd.localeCompare(ad);
        })
      );
    });
    return map;
  }, [filteredByControls]);

  function jumpToTopic(topic: Category) {
    setActiveTopic(topic);
    const el = document.getElementById(`topic-${toId(topic)}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* HERO (centered, Tailor-like: simple, editorial, premium) */}
      <header className="relative overflow-hidden border-b border-slate-200">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(99,102,241,0.10) 0%, rgba(255,255,255,1) 45%, rgba(99,102,241,0.06) 100%)",
          }}
        />
        <div className="relative">
          <Container>
            <div className="py-14 sm:py-16">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold tracking-wide text-slate-600">
                  Spryng Resource Center
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Register as an employer.
                  <span className="block">Stay audit-ready.</span>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                  State-by-state setup + recordkeeping guidance for small business owners who want clean, defensible systems.
                </p>

                {/* Quick search (hero) */}
                <div className="mx-auto mt-7 max-w-xl">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <span className="select-none text-slate-400">⌕</span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search: unemployment account, new hire reporting, record retention…"
                      className="w-full bg-transparent px-1 py-1 text-sm text-slate-900 outline-none"
                    />
                    <div className="hidden items-center gap-2 sm:flex">
                      <div className="h-6 w-px bg-slate-200" />
                      <select
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        className="rounded-xl bg-transparent px-2 py-1 text-sm text-slate-700 outline-none"
                        aria-label="Filter by state"
                      >
                        {STATES.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.code === "ALL" ? "All states" : `${s.code} — ${s.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/resources/employer-setup-checklist"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Get the Employer Setup Checklist
                    </Link>
                    <Link
                      href="#start-here"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Start here
                    </Link>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Filtering: <span className="font-semibold text-slate-900">{stateLabel}</span>
                    {query.trim() ? (
                      <>
                        {" "}
                        • Search: <span className="font-semibold text-slate-900">“{query.trim()}”</span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>

      {/* CATEGORY NAV (Tailor-like row, sticky, clean) */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <Container>
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TOPICS.map((t) => {
                const active = activeTopic === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => jumpToTopic(t.key)}
                    className={cx(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                    style={
                      active
                        ? { background: BRAND_SOFT, border: `1px solid ${BRAND_BORDER}` }
                        : { border: "1px solid transparent" }
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* compact state filter for mobile */}
            <div className="sm:hidden">
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                aria-label="Filter by state"
              >
                {STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code === "ALL" ? "All states" : s.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Container>
      </nav>

      {/* FEATURED (editorial, image-led like Tailor section style) */}
      <section className="bg-white py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {featured ? <FeaturedCard post={featured} /> : null}
            </div>
            <aside className="lg:col-span-4 space-y-6">
              {/* “Start with your state” compact module (Spryng differentiator) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Start with your state</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Filter guides and templates to what applies to you.
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: BRAND_SOFT, border: `1px solid ${BRAND_BORDER}` }}>
                    {stateCode === "ALL" ? "All states" : stateCode}
                  </span>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-700">State</label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    {STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => jumpToTopic("Employer Setup")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Employer setup
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToTopic("Audit-Ready Records")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Audit-ready records
                  </button>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Pro tip: state rules change—guides should show “Last updated.”
                </p>
              </div>

              <SubscribePanel />

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Most used templates</h3>
                <div className="mt-3 space-y-3">
                  <Link href="/resources/employer-setup-checklist" className="block hover:underline">
                    <div className="text-sm font-semibold text-slate-900">Employer Setup Checklist (Free)</div>
                    <div className="text-xs text-slate-500">Printable + digital</div>
                  </Link>
                  <Link href="/blog/template-proof-request-email" className="block hover:underline">
                    <div className="text-sm font-semibold text-slate-900">Proof request email scripts</div>
                    <div className="text-xs text-slate-500">Copy/paste</div>
                  </Link>
                  <Link href="/resources/audit-ready-records-checklist" className="block hover:underline">
                    <div className="text-sm font-semibold text-slate-900">Audit-ready records checklist</div>
                    <div className="text-xs text-slate-500">What to keep + how to label it</div>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* START HERE (tight, SaaS-grade) */}
      <section id="start-here" className="bg-slate-50 py-12">
        <Container>
          <SectionHeader
            title="Start here"
            subtitle="If you’re new to employer registration + audit-ready records, read these first."
            right={
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  jumpToTopic("Employer Setup");
                }}
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                See the full setup library →
              </Link>
            }
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {startHere.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* TOPIC SECTIONS (Tailor Brands pattern: big section title + grid of image cards) */}
      <section className="bg-white py-12">
        <Container>
          <div className="space-y-14">
            {TOPICS.map((t) => {
              const id = `topic-${toId(t.key)}`;
              const list = postsByTopic.get(t.key) || [];
              const top = list.slice(0, 6);

              return (
                <div key={t.key} id={id} className="scroll-mt-24">
                  <SectionHeader
                    title={t.label}
                    subtitle={t.blurb}
                    right={
                      <button
                        type="button"
                        onClick={() => jumpToTopic(t.key)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        View section →
                      </button>
                    }
                  />

                  {top.length ? (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {top.map((p) => (
                        <ArticleCard key={p.slug} post={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                      <div className="text-sm font-semibold text-slate-900">No matches</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Try clearing search or switching your state filter.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FOOTER BAND (premium, minimal) */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <Container>
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Want the cleanest path to employer-ready?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Download the checklist and set up your state accounts + record system the right way—once.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/resources/employer-setup-checklist"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Download checklist
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  style={{ borderColor: BRAND_BORDER }}
                >
                  See Spryng plans
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} Spryng</span>
              <span>
                State rules can change—always check “Last updated.”
              </span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
