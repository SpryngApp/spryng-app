// app/product/employer-setup/page.tsx
import Link from "next/link";
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Employer Setup — Spryng",
  description:
    "Employer Setup by Spryng: state-aware registration steps, proof capture, and what’s due next — built for small businesses before payroll and after.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Feature({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</div>
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

export default function EmployerSetupProductPage() {
  return (
    <main className="bg-white text-slate-900">
      <HeaderNav
        items={[
          { label: "How it works", href: "#how" },
          { label: "What you get", href: "#features" },
          { label: "FAQ", href: "#faq" },
          { label: "Resources", href: "/resources" },
        ]}
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
            <span>Product</span>
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Employer setup that feels calm — and actually gets finished.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Most new employers don’t need more information — they need a simple, state-aware plan:
            what to do, what to save, and what’s due next. Spryng is built for the moment
            before payroll — and after.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>State-aware steps</Pill>
            <Pill>Proof Vault</Pill>
            <Pill>UI deadlines</Pill>
            <Pill>Plain language</Pill>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-950"
            >
              Get my setup steps <span className="ml-2">→</span>
            </Link>
            <Link
              href="/resources/employer-checklist"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Read the checklist resource
            </Link>
          </div>

          <div className="mt-6 text-xs text-slate-500">
            Guidance + organization. Not legal or tax advice.
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-slate-200 bg-white">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              How Employer Setup works
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Three simple steps that keep you moving — without re-entering the same info.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Step
              n="1"
              title="Answer a few questions"
              body="Tell us your state and situation. We reuse your answers so you don’t repeat yourself."
            />
            <Step
              n="2"
              title="Follow your state-ready checklist"
              body="We generate the steps your state expects — plus a simple “save this” list so you’re covered later."
            />
            <Step
              n="3"
              title="Store proof + track what’s due next"
              body="Upload confirmation letters, set your first due date, and keep audit-ready records as you grow."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-slate-200 bg-slate-50">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              What you get
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Simple, actionable, educational — with the right “proof” moments built in.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Feature
              title="State-aware checklist"
              desc="Not a blog post. A guided plan you can actually finish — tailored to your state."
            />
            <Feature
              title="Proof Vault prompts"
              desc="We tell you what to save (and when). Confirmation letters become an organized record, not a scavenger hunt."
            />
            <Feature
              title="What’s due next"
              desc="After registration, we keep you oriented: first report due date, reminders, and a clean history over time."
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Feature
              title="Goal: first hire"
              desc="Set a calm milestone for your first official employee — with a guided path that celebrates progress."
            />
            <Feature
              title="Outside-payroll clarity"
              desc="If you pay helpers outside payroll, keep a defensible log that supports your story later."
            />
            <Feature
              title="Built for before payroll — and after"
              desc="Payroll handles a lot once you’re running it. Spryng helps you before you get there, and supports you after."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-slate-200 bg-white">
        <div className="container py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              FAQ
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Clear answers, no overpromising.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <FAQ
              q="Where do I register?"
              a="On your state’s official portal. Spryng helps you arrive prepared and tells you what to save as proof."
            />
            <FAQ
              q="Is this done-for-you registration?"
              a="Not in the MVP. We’re laying a clean foundation first. We may add assisted paths later depending on state requirements."
            />
            <FAQ
              q="What if I don’t pay wages often?"
              a="That’s common. Spryng helps you stay organized and aware of reporting obligations so nothing surprises you."
            />
            <FAQ
              q="Is Spryng legal or tax advice?"
              a="No. Spryng provides guidance and organization. For legal/tax advice, consult a qualified professional."
            />
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center">
            <h3 className="text-xl font-semibold text-slate-900">
              Ready to get your steps?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              Take the quiz and we’ll generate your employer setup checklist.
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
                Visit help center
              </Link>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Calm guidance. Clear steps. Not legal or tax advice.
            </div>
          </div>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
