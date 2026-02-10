// app/resources/employer-checklist/page.tsx
import Link from "next/link";
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Employer Setup Checklist — Spryng Resources",
  description:
    "A plain-language employer setup checklist: what to prepare, what to save as proof, and how to stay audit-ready after registration.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {desc ? (
        <div className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
          {n}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-relaxed text-slate-600">{body}</div>
        </div>
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-900">{q}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{a}</div>
    </div>
  );
}

export default function EmployerChecklistResourcePage() {
  return (
    <main className="bg-white text-slate-900">
      <HeaderNav
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Blog", href: "/blog" },
          { label: "Resources", href: "/resources" },
          { label: "Quiz", href: "/quiz" },
        ]}
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
            <span>Resource</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Employer setup checklist (plain language)
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            This is the calm, practical “what to do next” checklist most new employers wish they had.
            Spryng turns this into a guided flow tailored to your state — and a simple list of what to save as proof.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Registration-ready</Pill>
            <Pill>What to save</Pill>
            <Pill>UI reporting basics</Pill>
            <Pill>Stay audit-ready</Pill>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Get my checklist <span className="ml-2">→</span>
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
          {/* Main content */}
          <div className="space-y-8">
            <Card
              title="Before you open the state portal"
              desc="Most portals assume you already know what you’re doing. This is what to gather first so you don’t stall mid-form."
            >
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Legal business name + any DBA name</li>
                <li>Business address and mailing address (if different)</li>
                <li>Entity type (LLC, S-Corp, etc.) and formation date</li>
                <li>EIN (if you have one) and business contact details</li>
                <li>Owner/officer information (names, titles) as required by the state</li>
                <li>Expected first wage date / first employee date (estimate is okay)</li>
              </ul>
              <div className="mt-4 text-xs text-slate-500">
                Spryng keeps this minimal — we only ask for what’s needed to generate your steps.
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card
                title="What to do during registration"
                desc="Your goal is clarity, not speed. Move carefully and save the right checkpoints."
              >
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Confirm you’re on the official state site</li>
                  <li>Write down the account/confirmation number immediately</li>
                  <li>Screenshot or download confirmation pages</li>
                  <li>Save any “next steps” messages from the state</li>
                </ul>
              </Card>

              <Card
                title="What to save as proof"
                desc="These are the files you’ll wish you had later — save them once, stay calm later."
              >
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                  <li>Registration confirmation letter (PDF, screenshot, or email)</li>
                  <li>Employer account number notice</li>
                  <li>Any follow-up request letters from the state</li>
                  <li>Wage report submission confirmations (each quarter)</li>
                </ul>
              </Card>
            </div>

            <Card
              title="After you’re registered: what happens next?"
              desc="Registration is step one. The next value is knowing what’s due and keeping your record clean."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <Step
                  n="1"
                  title="Set your first reporting due date"
                  body="Once the state assigns your account, you’ll have reporting cycles. Spryng helps you track the first one and keep it visible."
                />
                <Step
                  n="2"
                  title="Log wages paid outside payroll (if any)"
                  body="If you pay helpers outside payroll, keep a simple, defensible log so you can explain who got paid, for what, and why."
                />
                <Step
                  n="3"
                  title="Store proof in one place"
                  body="Confirmation letters and submissions are easy to lose. One clean vault is the difference between panic and confidence."
                />
              </div>
            </Card>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <div className="max-w-3xl">
                <h2 className="text-lg font-semibold text-slate-900">FAQ</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Clear answers — no overpromising.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <FAQ
                  q="Will the state portal guide me anyway?"
                  a="Usually, yes — but portals are not designed to teach. Spryng exists so you know what to expect, what to save, and what’s due next."
                />
                <FAQ
                  q="Is this legal or tax advice?"
                  a="No. Spryng provides guidance and organization based on state workflows. For legal or tax advice, consult a qualified professional."
                />
                <FAQ
                  q="What if I’m not running payroll yet?"
                  a="That’s exactly who Spryng is built for: stay audit-ready before you start running payroll — and after."
                />
                <FAQ
                  q="Can Spryng register me for me?"
                  a="Not in the MVP. We’re building a clean foundation first. Done-for-you paths may be added later depending on state requirements."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                Ready to get your state steps?
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
                  href="/resources"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Back to resources
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Quick version</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• Gather key business details</li>
                <li>• Register on the state portal</li>
                <li>• Save confirmation + account number</li>
                <li>• Track what’s due next</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Related</div>
              <div className="mt-3 grid gap-2 text-sm">
                <Link className="text-slate-700 hover:text-slate-900" href="/resources">
                  Resource library
                </Link>
                <Link className="text-slate-700 hover:text-slate-900" href="/product/employer-setup">
                  Employer Setup product page
                </Link>
                <Link className="text-slate-700 hover:text-slate-900" href="/help">
                  Help center
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
