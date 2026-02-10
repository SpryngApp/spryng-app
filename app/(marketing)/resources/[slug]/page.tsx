// app/(marketing)/resources/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

type GuideSection =
  | { kind: "text"; title: string; body: string }
  | { kind: "bullets"; title: string; bullets: string[] }
  | { kind: "callout"; title: string; body: string };

type Guide = {
  slug: string;
  title: string;
  description: string;
  pills: string[];
  sections: GuideSection[];
  cta?: { label: string; href: string };
};

const GUIDES: Record<string, Guide> = {
  "employer-checklist": {
    slug: "employer-checklist",
    title: "Employer setup checklist (plain language)",
    description:
      "A calm checklist: what to prepare, what to save, and what to do right after registration.",
    pills: ["Start here", "Checklist", "Not legal or tax advice"],
    sections: [
      {
        kind: "bullets",
        title: "Before you start",
        bullets: [
          "Business legal name + DBA (if any).",
          "Entity type and formation date.",
          "EIN (if you have it) and business contact info.",
          "Expected first wage/employee date (estimate is fine).",
        ],
      },
      {
        kind: "bullets",
        title: "During registration",
        bullets: [
          "Confirm the portal is the official state site.",
          "Save the account/confirmation number immediately.",
          "Download or screenshot confirmation pages.",
        ],
      },
      {
        kind: "bullets",
        title: "After registration",
        bullets: [
          "Upload confirmations/notices to Proof Vault.",
          "Set your first due date (or set a reminder to confirm it).",
          "Turn on reminders and keep records clean as you grow.",
        ],
      },
      {
        kind: "callout",
        title: "How this becomes product UI",
        body:
          "This maps directly to the Guided Tiles dashboard: Registration, Proof Vault, and First Hire Goal — simple, actionable, and educational.",
      },
    ],
    cta: { label: "Get my state checklist", href: "/quiz" },
  },

  "employer-registration-basics": {
    slug: "employer-registration-basics",
    title: "When do I need to register as an employer?",
    description:
      "A simple way to decide if you need to register now — and what changes once you hire.",
    pills: ["Basics", "Decision clarity", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "The simple way to think about it",
        body:
          "Employer registration is about becoming known to the state as an employer for unemployment insurance (and related reporting). If you’re paying people to work for your business — or preparing for your first employee — you want clarity on what your state expects and what proof to keep.",
      },
      {
        kind: "bullets",
        title: "Signals to check your requirement",
        bullets: [
          "You’re about to hire your first employee (even part-time).",
          "You’ve already paid wages and you’re unsure what the state expects.",
          "You received a letter mentioning employer/UI reporting.",
          "You want to build a clean proof trail now.",
        ],
      },
      {
        kind: "callout",
        title: "What Spryng does (and doesn’t)",
        body:
          "Spryng provides state-aware steps and organization in plain language. You register on official state portals. Spryng helps you know what to do, what to save, and what’s due next. Not legal or tax advice.",
      },
    ],
    cta: { label: "Generate my checklist", href: "/quiz" },
  },

  "what-to-save-as-proof": {
    slug: "what-to-save-as-proof",
    title: "What to save as proof (so you’re covered later)",
    description:
      "The short list of confirmations and documents to save after registration and filings.",
    pills: ["Proof", "Audit-ready habits", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "Why proof matters",
        body:
          "Most stress comes from missing confirmations and receipts. Save proof once and you stay calm later.",
      },
      {
        kind: "bullets",
        title: "Save these after registration",
        bullets: [
          "Registration confirmation page (PDF or screenshot).",
          "Employer account number notice (or any letter assigning it).",
          "Portal login details stored securely.",
          "Any follow-up requests from the state.",
        ],
      },
      {
        kind: "bullets",
        title: "Save these after each filing",
        bullets: [
          "Submission confirmation/receipt.",
          "A copy of what was filed (if available).",
          "Payment confirmation tied to the filing.",
        ],
      },
    ],
    cta: { label: "Start Proof Vault", href: "/app/checklist" },
  },

  "ui-reporting-basics": {
    slug: "ui-reporting-basics",
    title: "UI reporting: what’s due and when?",
    description:
      "A plain-language overview of unemployment insurance reporting and why deadlines matter.",
    pills: ["UI", "Basics", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "What UI reporting usually means",
        body:
          "Most states expect periodic wage reporting once you’re registered as an employer (often quarterly). Even before payroll, you want to know what your state expects and when the first report is due.",
      },
      {
        kind: "bullets",
        title: "Keep these 3 things simple",
        bullets: [
          "What’s due (wage report, payment, or both).",
          "When it’s due (first due date + recurring cycle).",
          "Proof you filed (receipt + copy).",
        ],
      },
    ],
    cta: { label: "Get reminders set up", href: "/app/checklist" },
  },

  "ui-deadlines": {
    slug: "ui-deadlines",
    title: "UI deadlines: what to track (and why it matters)",
    description:
      "A simple framework for staying ahead of wage reports, filing windows, and notices.",
    pills: ["Deadlines", "Framework", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "Your goal: never be surprised",
        body:
          "You’re building a small system: what’s due, when it’s due, and proof it was done.",
      },
      {
        kind: "bullets",
        title: "Track these items",
        bullets: [
          "Quarterly wage report due dates (or the state’s cadence).",
          "Payment due dates tied to filings (if applicable).",
          "Notices: what they asked for + response deadlines.",
          "Proof: receipts, confirmations, copies of filings.",
        ],
      },
      {
        kind: "callout",
        title: "In Spryng",
        body:
          "This becomes a Deadlines tile with next due date + a single next action — not a cluttered calendar.",
      },
    ],
    cta: { label: "Open my checklist", href: "/app/checklist" },
  },

  "outside-payroll-records": {
    slug: "outside-payroll-records",
    title: "Outside-payroll tracking: what to record",
    description:
      "What to log when you pay helpers outside payroll so you can explain ‘who got paid, for what, and why.’",
    pills: ["Tracking", "Defensible logs", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "Defensible simplicity",
        body:
          "You don’t need complexity. You need consistency: who, how much, when, for what, and what proof exists.",
      },
      {
        kind: "bullets",
        title: "Minimum fields to log",
        bullets: [
          "Payee name + business name (if applicable).",
          "Date paid + amount.",
          "What the payment was for (short label).",
          "Payment method (ACH, cash, check, etc.).",
          "Proof link/attachment (invoice, receipt, W-9, etc.).",
        ],
      },
    ],
    cta: { label: "Go to Tracking", href: "/app/tracking" },
  },

  "audit-readiness": {
    slug: "audit-readiness",
    title: "Audit readiness (without the panic)",
    description:
      "What it means to be audit-ready in practical terms — and the proof trail to keep.",
    pills: ["Audit-ready", "Calm clarity", "Not legal or tax advice"],
    sections: [
      {
        kind: "text",
        title: "Audit-ready = explainable + provable",
        body:
          "It’s about being able to explain what happened and prove it quickly: registrations, filings, and payments.",
      },
      {
        kind: "bullets",
        title: "The proof trail to maintain",
        bullets: [
          "Registration confirmations + account numbers.",
          "Filing receipts + copies (wage reports, etc.).",
          "Payment records and supporting docs (invoices/W-9s as applicable).",
          "A simple timeline of what was done and when.",
        ],
      },
    ],
    cta: { label: "Start building your proof trail", href: "/quiz" },
  },

  "proof-templates": {
    slug: "proof-templates",
    title: "Proof request templates (W-9, invoice, COI)",
    description:
      "Simple messages you can send to collect proof docs without sounding harsh or legal-y.",
    pills: ["Templates", "Proof Vault", "Not legal or tax advice"],
    sections: [
      {
        kind: "bullets",
        title: "W-9 request (friendly)",
        bullets: [
          "Hi — quick admin item so our records stay clean: can you send a completed W-9 for your file? Thanks!",
        ],
      },
      {
        kind: "bullets",
        title: "Invoice request (simple)",
        bullets: [
          "Hi — can you send an invoice for the work completed (date range + service description)? I’m organizing our records. Thank you.",
        ],
      },
      {
        kind: "bullets",
        title: "COI request (if applicable)",
        bullets: [
          "Hi — can you share your current certificate of insurance (COI) for our records? Appreciate it.",
        ],
      },
    ],
    cta: { label: "Open Proof Vault", href: "/app/checklist" },
  },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Section({ s }: { s: GuideSection }) {
  if (s.kind === "text") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
      </section>
    );
  }
  if (s.kind === "bullets") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{s.title}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {s.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-base font-semibold text-slate-900">{s.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</p>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ slug: string }>;
}) {
  const p = params ? await params : null;
  const slug = p?.slug ?? "";
  const g = GUIDES[slug];
  if (!g) return { title: "Resource — Spryng" };
  return { title: `${g.title} — Spryng`, description: g.description };
}

export default async function ResourceGuidePage({
  params,
}: {
  params?: Promise<{ slug: string }>;
}) {
  const p = params ? await params : null;
  const slug = p?.slug ?? "";
  const guide = GUIDES[slug];
  if (!guide) notFound();

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

      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Link className="hover:text-slate-900" href="/resources">
              Resources
            </Link>
            <span aria-hidden>→</span>
            <span className="text-slate-900">{guide.title}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {guide.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {guide.pills.map((p2) => (
              <Pill key={p2}>{p2}</Pill>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={guide.cta?.href ?? "/quiz"}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
            >
              {guide.cta?.label ?? "Start the quiz"} <span className="ml-2">→</span>
            </Link>
            <Link
              href="/resources"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to resources
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {guide.sections.map((s) => (
              <Section key={s.title} s={s} />
            ))}

            <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                Want steps tailored to your state?
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Take the 2-minute quiz and we’ll generate a checklist + what to save.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/quiz"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
                >
                  Start the quiz <span className="ml-2">→</span>
                </Link>
                <Link
                  href="/help"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Open Help Center
                </Link>
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Next action</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Use this guide as “tile logic”: one next action, then proof, then deadlines.
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/product/employer-setup"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Employer Setup overview →
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  More resources →
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">Reminder</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Spryng helps you stay audit-ready{" "}
                <span className="font-semibold">
                  before you start running payroll — and after
                </span>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
