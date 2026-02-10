// app/(marketing)/resources/page.tsx
import Link from "next/link";
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Resources — Spryng",
  description:
    "Plain-language employer setup resources: registration basics, what to save as proof, and UI reporting clarity.",
};

type Category = "all" | "setup" | "proof" | "deadlines" | "tracking";

type Guide = {
  slug: string;
  title: string;
  desc: string;
  category: Exclude<Category, "all">;
  pills: string[];
};

const GUIDES: Guide[] = [
  {
    slug: "employer-checklist",
    title: "Employer setup checklist (plain language)",
    desc: "A calm checklist: what to prepare, what to save, and what to do right after registration.",
    category: "setup",
    pills: ["Start here", "Checklist"],
  },
  {
    slug: "employer-registration-basics",
    title: "When do I need to register as an employer?",
    desc: "A simple way to decide if you need to register now — and what changes once you hire.",
    category: "setup",
    pills: ["Basics", "Decision clarity"],
  },
  {
    slug: "what-to-save-as-proof",
    title: "What to save as proof (so you’re covered later)",
    desc: "The short list of confirmations and documents to save after registration and filings.",
    category: "proof",
    pills: ["Proof", "Audit-ready habits"],
  },
  {
    slug: "ui-deadlines",
    title: "UI deadlines: what to track (and why it matters)",
    desc: "A simple framework for staying ahead of wage reports, filing windows, and notices.",
    category: "deadlines",
    pills: ["Deadlines", "Framework"],
  },
  {
    slug: "ui-reporting-basics",
    title: "UI reporting: what’s due and when?",
    desc: "A plain-language overview of unemployment insurance reporting and why deadlines matter.",
    category: "deadlines",
    pills: ["UI", "Basics"],
  },
  {
    slug: "outside-payroll-records",
    title: "Outside-payroll tracking: what to record",
    desc: "What to log when you pay helpers outside payroll so you can explain ‘who got paid, for what, and why.’",
    category: "tracking",
    pills: ["Recordkeeping", "Defensible logs"],
  },
  {
    slug: "audit-readiness",
    title: "Audit readiness (without the panic)",
    desc: "What it means to be audit-ready in practical terms — and the proof trail to keep.",
    category: "proof",
    pills: ["Audit-ready", "Calm clarity"],
  },
  {
    slug: "proof-templates",
    title: "Proof request templates (W-9, invoice, COI)",
    desc: "Simple messages you can send to collect proof docs without sounding harsh or legal-y.",
    category: "proof",
    pills: ["Templates", "Proof Vault"],
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  all: "All",
  setup: "Employer setup",
  proof: "Proof Vault",
  deadlines: "Deadlines",
  tracking: "Tracking",
};

type SP = Record<string, string | string[] | undefined>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      )}
    >
      {children}
    </Link>
  );
}

function GuideTile({
  title,
  desc,
  href,
  pills,
  cta = "Read",
}: {
  title: string;
  desc: string;
  href: string;
  pills?: string[];
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>

          {pills?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {pills.map((p) => (
                <Pill key={p}>{p}</Pill>
              ))}
            </div>
          ) : null}
        </div>

        <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition group-hover:bg-slate-50">
          {cta}{" "}
          <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
        </span>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-slate-200/25 blur-3xl"
      />
    </Link>
  );
}

function buildResourcesHref(category: Category, qParam: string) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (qParam) params.set("q", qParam);
  const qs = params.toString();
  return qs ? `/resources?${qs}` : "/resources";
}

export default async function ResourcesPage({
  searchParams,
}: {
  // Next.js 15 typegen expects Promise-based searchParams in some modes.
  searchParams?: Promise<SP>;
}) {
  const sp: SP = searchParams ? await searchParams : {};

  const rawCategory = sp.category;
  const category: Category =
    typeof rawCategory === "string" &&
    (Object.keys(CATEGORY_LABELS) as Category[]).includes(rawCategory as Category)
      ? (rawCategory as Category)
      : "all";

  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const qParam = rawQ.trim(); // keep what user typed for URLs / input
  const q = qParam.toLowerCase(); // normalized for filtering

  const filtered = GUIDES.filter((g) => {
    const categoryOk = category === "all" ? true : g.category === category;
    const qOk = !q
      ? true
      : `${g.title} ${g.desc} ${g.pills.join(" ")}`.toLowerCase().includes(q);
    return categoryOk && qOk;
  });

  return (
    <main className="bg-white text-slate-900">
      <HeaderNav
        items={[
          { label: "How it works", href: "/#how" },
          { label: "What you get", href: "/#features" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Resources", href: "/resources" },
        ]}
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
            <span>Plain-language guidance</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Resources
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Calm, clear explanations for employer setup and staying audit-ready.
            No jargon. No overpromising. Not legal or tax advice.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Get my setup steps <span className="ml-2">→</span>
            </Link>
            <Link
              href="/product/employer-setup"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              See Employer Setup product
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Top tiles */}
            <div className="grid gap-4 md:grid-cols-2">
              <GuideTile
                title="Blog"
                desc="Short posts with practical clarity: employer setup, UI reporting, and staying audit-ready as you grow."
                href="/blog"
                pills={["Updates", "Plain language", "Real scenarios"]}
                cta="Browse"
              />
              <GuideTile
                title="Employer Setup Checklist"
                desc="A calm, practical checklist you can follow — and the proof you’ll want to keep."
                href="/resources/employer-checklist"
                pills={["Start here", "Checklist"]}
                cta="Open"
              />
            </div>

            {/* Filters */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                    <TabLink
                      key={c}
                      href={buildResourcesHref(c, qParam)}
                      active={c === category}
                    >
                      {CATEGORY_LABELS[c]}
                    </TabLink>
                  ))}
                </div>

                {/* Server-rendered search (GET) */}
                <form method="get" action="/resources" className="flex gap-2">
                  {category !== "all" ? (
                    <input type="hidden" name="category" value={category} />
                  ) : null}

                  <label className="sr-only" htmlFor="q">
                    Search resources
                  </label>
                  <input
                    id="q"
                    name="q"
                    defaultValue={qParam}
                    placeholder="Search…"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 md:w-64"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-950"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "guide" : "guides"}.
              </div>
            </div>

            {/* Guide tiles */}
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((g) => (
                <GuideTile
                  key={g.slug}
                  title={g.title}
                  desc={g.desc}
                  href={`/resources/${g.slug}`}
                  pills={g.pills}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center">
              <h3 className="text-xl font-semibold text-slate-900">
                Want your steps personalized to your state?
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Take the quiz and we’ll generate your checklist and “save this as proof” list.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/quiz"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
                >
                  Start the quiz <span className="ml-2">→</span>
                </Link>
                <Link
                  href="/product/employer-setup"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  See Employer Setup
                </Link>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Calm guidance. Clear steps. Not legal or tax advice.
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Start here</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                If you’re paying helpers (or preparing to hire), this is the fastest path:
              </p>
              <ol className="mt-3 space-y-2 text-sm text-slate-700">
                <li>1) Get your state checklist</li>
                <li>2) Save proof + account details</li>
                <li>3) Track what’s due next</li>
              </ol>

              <div className="mt-5 grid gap-2">
                <Link
                  href="/quiz"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-950"
                >
                  Get my checklist →
                </Link>
                <Link
                  href="/resources/employer-checklist"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Read the checklist guide
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Reminder</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Spryng helps you stay audit-ready{" "}
                <span className="font-semibold text-slate-900">
                  before you start running payroll — and after
                </span>
                .
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">Need help?</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Visit the help center for the fastest answers and next steps.
              </p>
              <div className="mt-4">
                <Link
                  href="/help"
                  className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Open Help Center →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
