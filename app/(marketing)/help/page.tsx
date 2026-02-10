// app/(marketing)/help/page.tsx
import Link from "next/link";
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Help — Spryng",
  description:
    "Help center for Spryng: employer setup guidance, proof vault, deadlines, and tracking support.",
};

function Card({
  title,
  desc,
  href,
  cta = "Open",
}: {
  title: string;
  desc: string;
  href: string;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
        </div>
        <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 group-hover:bg-slate-50">
          {cta} <span className="ml-2">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function HelpPage() {
  return (
    <main className="bg-white text-slate-900">
      <HeaderNav />

      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
            <span>Help Center</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Simple, actionable answers—built around what you should do next:
            register correctly, save proof, set deadlines, and keep records clean.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Get my checklist <span className="ml-2">→</span>
            </Link>
            <Link
              href="/resources"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Browse resources
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            title="Employer Setup (start here)"
            desc="Understand what to do first, where to register, and what to save as proof."
            href="/product/employer-setup"
            cta="View"
          />
          <Card
            title="Proof Vault basics"
            desc="What documents to collect and how to stay organized without spreadsheets."
            href="/resources/what-to-save-as-proof"
          />
          <Card
            title="UI deadlines"
            desc="What to track, why deadlines matter, and how to avoid surprises."
            href="/resources/ui-deadlines"
          />
          <Card
            title="Outside-payroll tracking"
            desc="What to log when you pay helpers outside payroll and how to keep it defensible."
            href="/resources/outside-payroll-records"
          />
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-lg font-semibold text-slate-900">
            Reminder
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Spryng provides guided steps and organization. It’s not legal or tax advice.
            If you need legal/tax advice, consult a qualified professional.
          </p>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
