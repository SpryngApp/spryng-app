// app/page.tsx
"use client";

import * as React from "react";
import SpryngFooter from "@/components/marketing/SpryngFooter";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** --------------------------------------------------------------------------
 * Inline icons (no lucide-react dependency)
 * - bumped stroke widths so icons feel stronger (less “washed out”)
 * -------------------------------------------------------------------------- */
const Icon = {
  ArrowRight: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  Sparkles: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M12 2l1.2 4.2L17 7.4l-3.8 1.2L12 13l-1.2-4.4L7 7.4l3.8-1.2L12 2Z" />
      <path d="M19 12l.7 2.4L22 15l-2.3.6L19 18l-.7-2.4L16 15l2.3-.6L19 12Z" />
    </svg>
  ),
  CheckCircleBold: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),

  // Large "strip" icons (stronger + larger)
  MapLg: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" {...p}>
      <path d="M9 18l-6 2V6l6-2 6 2 6-2v14l-6 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  ),
  CalendarLg: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" {...p}>
      <path d="M7 2v3" />
      <path d="M17 2v3" />
      <path d="M3.5 9h17" />
      <path d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 13h2" />
      <path d="M12 13h2" />
      <path d="M16 13h2" />
      <path d="M8 17h2" />
      <path d="M12 17h2" />
    </svg>
  ),
  ShieldLg: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" {...p}>
      <path d="M12 2l8 4v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4Z" />
      <path d="M9 12l2.2 2.2L16 9.4" />
    </svg>
  ),

  // Smaller icons used elsewhere
  ClipboardCheckLg: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" {...p}>
      <path d="M9 4h6l1 2h3v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h3l1-2Z" />
      <path d="M9 4v2h6V4" />
      <path d="M8.2 13.2l2.2 2.2 5.8-5.8" />
    </svg>
  ),
  BellLg: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.35" {...p}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
      <path d="M12 6v2" />
    </svg>
  ),

  ClipboardCheck: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M9 4h6l1 2h3v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h3l1-2Z" />
      <path d="M9 4v2h6V4" />
      <path d="M8.5 13l2 2 5-5" />
    </svg>
  ),
  Bell: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  ),

  Menu: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  ),
  X: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...p}>
      <path d="M6 6l12 12" />
      <path d="M18 6l-12 12" />
    </svg>
  ),
};

const PRIMARY_STRIP = [
  {
    title: "State-ready employer setup",
    desc: "A checklist tailored to your state—so you register the right way.",
    icon: Icon.MapLg,
  },
  {
    title: "UI deadlines, handled",
    desc: "Reminders for wage reports + filings so nothing sneaks up on you.",
    icon: Icon.CalendarLg,
  },
  {
    title: "Stay clean as you grow",
    desc: "Organized records you can pull fast when it matters (Pro).",
    icon: Icon.ShieldLg,
  },
];

function ToastCard({
  tone,
  label,
  title,
  desc,
  icon,
}: {
  tone: "emerald" | "indigo" | "amber";
  label: string;
  title: string;
  desc?: string;
  icon: React.ReactNode;
}) {
  const toneMap: Record<typeof tone, { ring: string; bg: string; text: string }> = {
    emerald: { ring: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-900" },
    indigo: { ring: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-900" },
    amber: { ring: "border-amber-200", bg: "bg-amber-50", text: "text-amber-900" },
  };
  const t = toneMap[tone];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg shadow-black/5">
      <div className="flex items-start gap-3">
        <span className={cx("mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border", t.ring, t.bg, t.text)}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-medium text-neutral-500">{label}</div>
          <div className="mt-0.5 text-sm font-semibold text-neutral-900">{title}</div>
          {desc ? <div className="mt-1 text-xs text-neutral-600">{desc}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** --------------------------------------------------------------------------
 * Ramp-style email capture (single component)
 * -------------------------------------------------------------------------- */
function HeroEmailCapture({
  email,
  setEmail,
  emailError,
  onSubmit,
  brandTextClass,
  getStartedHref,
}: {
  email: string;
  setEmail: (v: string) => void;
  emailError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  brandTextClass: string;
  getStartedHref: string;
}) {
  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-xl md:mx-0" noValidate>
      <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex-1">
            <label htmlFor="hero-email" className="sr-only">
              Work email
            </label>
            <input
              id="hero-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="What’s your work email?"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cx(
                "h-12 w-full rounded-xl border bg-white px-4 text-sm text-neutral-900 outline-none transition",
                "placeholder:text-neutral-400",
                emailError
                  ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                  : "border-neutral-200 focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100"
              )}
            />
            {emailError ? <div className="mt-2 text-left text-xs text-red-600">{emailError}</div> : null}
          </div>

          <button type="submit" className="btn btn-primary h-12 px-5" aria-label="Get started for free">
            Get started for free <Icon.ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2 px-1 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Built for clarity. Clear steps you can follow.</span>
          <a href="#how" className="inline-flex items-center gap-2 text-neutral-700 hover:text-black">
            See how it works <span aria-hidden>→</span>
          </a>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-neutral-500 md:text-left">
        By continuing, you agree to receive setup steps and reminders.{" "}
        <a className={cx("underline decoration-neutral-300 underline-offset-4 hover:text-black", brandTextClass)} href={getStartedHref}>
          Start free
        </a>
        .
      </div>
    </form>
  );
}

function PriceCard({
  tone,
  label,
  name,
  price,
  subprice,
  blurb,
  points,
  cta,
  ctaHref,
  badge,
}: {
  tone: "free" | "pro";
  label: string;
  name: string;
  price: string;
  subprice?: string;
  blurb: string;
  points: string[];
  cta: string;
  ctaHref: string;
  badge?: string;
}) {
  const pro = tone === "pro";

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      {/* removed the “blob” glow entirely */}

      {badge ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-800 shadow-sm">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[color:rgb(var(--brand))]" />
          {badge}
        </div>
      ) : null}

      <div className="text-xs font-medium tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-neutral-900">{name}</div>

      <div className="mt-4 flex items-end gap-2">
        <div className="font-heading text-5xl leading-none">{price}</div>
        {subprice ? <div className="pb-1 text-sm text-neutral-600">{subprice}</div> : null}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-neutral-700">{blurb}</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="text-sm font-semibold text-neutral-900">What’s included</div>
        <ul className="mt-3 space-y-2">
          {points.map((pt) => (
            <li key={pt} className="flex items-start gap-2 text-sm text-neutral-700">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200">
                <Icon.Check className="h-3.5 w-3.5 text-[color:rgb(var(--brand))]" />
              </span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto">
        <a
          href={ctaHref}
          className={cx(
            "btn mt-6 h-11 w-full",
            pro ? "btn-primary" : "btn-ghost",
            !pro ? "border border-neutral-200 bg-white hover:bg-neutral-50" : null
          )}
        >
          {cta} {pro ? <Icon.ArrowRight className="ml-2 h-4 w-4" /> : null}
        </a>

        <div className="mt-3 text-center text-xs text-neutral-500">
          {pro
            ? "Cancel anytime. Guidance + organization tools (not legal advice)."
            : "Best for the “I’m paying helpers and I want the steps” moment."}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // No /login or /signup yet → route actions to the real “entry” for now.
  const GET_STARTED_HREF = "/quiz";
  const LOGIN_HREF = "/quiz";

  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const HERO_IMAGE = "/images/hero-owner.png";
  const FEATURE_IMAGE_1 = "/images/feature-1.png";
  const FEATURE_IMAGE_2 = "/images/feature-2.png";

  const BRAND_TEXT = "text-[color:rgb(var(--brand))]";
  const BRAND_BG = "bg-[color:rgb(var(--brand))]";

  function validateEmail(v: string) {
    const s = v.trim();
    if (!s) return "Please enter your email.";
    if (s.length > 254) return "That email looks too long.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Enter a valid email (e.g., name@company.com).";
    return null;
  }

  function onSubmitHeroEmail(e: React.FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    const next = `${GET_STARTED_HREF}?email=${encodeURIComponent(email.trim())}`;
    window.location.href = next;
  }

  return (
    <main className="bg-white text-neutral-900">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-md border border-neutral-200 bg-white">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--brand)),transparent_60%)] opacity-70" />
              <div className={cx("absolute left-1.5 top-1.5 h-2 w-2 rounded-full", BRAND_BG)} />
            </div>
            <span className="font-heading text-sm tracking-wide">SPRYNG</span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-7 text-sm text-neutral-700 md:flex">
            <a href="#how" className="hover:text-black">
              How it works
            </a>
            <a href="#features" className="hover:text-black">
              What you get
            </a>
            <a href="#pricing" className="hover:text-black">
              Pricing
            </a>
            <a href="/resources" className="hover:text-black">
              Resources
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a href={LOGIN_HREF} className="btn btn-ghost hidden h-9 md:inline-flex" title="Login (coming soon)">
              Log in
            </a>
            <a href={GET_STARTED_HREF} className="btn btn-primary hidden h-9 sm:inline-flex">
              Start free
            </a>

            <button
              type="button"
              className="btn btn-ghost h-9 px-3 sm:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <Icon.X className="h-5 w-5" /> : <Icon.Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-neutral-200 bg-white">
            <div className="container py-3">
              <div className="grid gap-2 text-sm text-neutral-800">
                <a className="rounded-lg px-3 py-2 hover:bg-neutral-50" href="#how" onClick={() => setMobileOpen(false)}>
                  How it works
                </a>
                <a className="rounded-lg px-3 py-2 hover:bg-neutral-50" href="#features" onClick={() => setMobileOpen(false)}>
                  What you get
                </a>
                <a className="rounded-lg px-3 py-2 hover:bg-neutral-50" href="#pricing" onClick={() => setMobileOpen(false)}>
                  Pricing
                </a>
                <a className="rounded-lg px-3 py-2 hover:bg-neutral-50" href="/resources">
                  Resources
                </a>
              </div>

              <div className="mt-3 grid gap-2">
                <a href={LOGIN_HREF} className="btn btn-ghost h-11 w-full" title="Login (coming soon)">
                  Log in
                </a>
                <a href={GET_STARTED_HREF} className="btn btn-primary h-11 w-full">
                  Start free
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-neutral-50 via-white to-white">
        {/* subtle grid only (kept). removed extra competing “blobs” for a cleaner hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_55%,transparent_80%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        <div className="container relative py-16 sm:py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-14">
            {/* Left copy */}
            <div className="text-center md:text-left">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm md:mx-0">
                <Icon.Sparkles className={cx("h-3.5 w-3.5", BRAND_TEXT)} />
                <span>Free employer setup checklist + UI filing reminders</span>
              </div>

              <h1 className="font-heading text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
                Register as an employer—
                <span className="block">then stay audit-ready.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-neutral-700 sm:text-lg md:mx-0 md:text-xl">
                Turn “I’m paying helpers” into{" "}
                <span className="font-semibold text-neutral-900">a clean, state-ready setup</span>—then{" "}
                <span className="text-neutral-900">stay on top of UI deadlines</span> and keep records clean as you grow.
              </p>

              <p className="mx-auto mt-4 max-w-xl text-sm text-neutral-600 md:mx-0 md:text-base">
                Built on state-specific steps—so you know what to do, what to save, and what’s due next.
              </p>

              <HeroEmailCapture
                email={email}
                setEmail={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(null);
                }}
                emailError={emailError}
                onSubmit={onSubmitHeroEmail}
                brandTextClass={BRAND_TEXT}
                getStartedHref={GET_STARTED_HREF}
              />
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${HERO_IMAGE}")` }} />
                <div className="absolute inset-0 bg-white/10" />

                <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[560px]">
                  {/* Mobile stack */}
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 grid gap-2 md:hidden">
                    <ToastCard
                      tone="emerald"
                      label="Success"
                      title="Employer registration complete (GA)"
                      desc="Confirmation saved to your file."
                      icon={<Icon.CheckCircleBold className="h-5 w-5" />}
                    />
                    <ToastCard
                      tone="indigo"
                      label="Milestone"
                      title="You hired your first employee"
                      desc="Deadlines + records stay organized."
                      icon={<Icon.ClipboardCheck className="h-5 w-5" />}
                    />
                    <ToastCard
                      tone="amber"
                      label="Next up"
                      title="UI Wage Report due in 21 days"
                      desc="Reminder scheduled (and adjustable)."
                      icon={<Icon.Bell className="h-5 w-5" />}
                    />
                  </div>

                  {/* Desktop float */}
                  <div className="pointer-events-none hidden md:block">
                    <div className="absolute right-7 top-7 w-[340px] rotate-[0.25deg]">
                      <ToastCard
                        tone="emerald"
                        label="Success"
                        title="Employer registration complete (GA)"
                        desc="Confirmation saved to your file."
                        icon={<Icon.CheckCircleBold className="h-5 w-5" />}
                      />
                    </div>

                    <div className="absolute right-10 top-1/2 w-[360px] -translate-y-1/2 rotate-[-0.35deg]">
                      <ToastCard
                        tone="indigo"
                        label="Milestone"
                        title="You hired your first employee"
                        desc="Deadlines + records stay organized."
                        icon={<Icon.ClipboardCheck className="h-5 w-5" />}
                      />
                    </div>

                    <div className="absolute bottom-7 left-7 w-[380px] rotate-[0.15deg]">
                      <ToastCard
                        tone="amber"
                        label="Next up"
                        title="UI Wage Report due in 21 days"
                        desc="Reminder scheduled (and adjustable)."
                        icon={<Icon.Bell className="h-5 w-5" />}
                      />
                    </div>

                    <div className="absolute bottom-4 right-6 hidden text-xs text-neutral-700/80 lg:block">Built for clarity.</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center text-xs text-neutral-500 md:hidden">Reminders + records stay organized as you grow.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Big strip (icons bigger + darker/stronger) */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="container py-10">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-3 md:gap-12">
              {PRIMARY_STRIP.map((b) => {
                const I = b.icon;
                return (
                  <div key={b.title} className="flex items-start gap-5">
                    <span className="mt-0.5 inline-flex h-12 w-12 items-center justify-center text-[color:rgb(var(--brand))]">
                      <I className="h-12 w-12" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[18px] font-semibold leading-snug text-neutral-900">{b.title}</div>
                      <div className="mt-1 text-sm text-neutral-600">{b.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-neutral-200 bg-neutral-50">
        <div className="container py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 shadow-sm">
              <Icon.Sparkles className={cx("h-3.5 w-3.5", BRAND_TEXT)} />
              <span>Simple system. Real progress.</span>
            </div>

            <h2 className="mt-4 font-heading text-3xl tracking-tight md:text-4xl">
              Level up your business in <span className="font-semibold text-neutral-900">3 clear steps</span>.
            </h2>

            <p className="mt-3 text-neutral-700">
              Setup first. Deadlines next. Then a clean record system you can actually maintain.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "Step 1",
                title: "Get registered the right way",
                body: "Answer a few questions. We generate the exact steps your state expects—and what to save as proof.",
                icon: <Icon.ClipboardCheckLg className="h-11 w-11 text-[color:rgb(var(--brand))]" />,
              },
              {
                step: "Step 2",
                title: "Stay ahead of UI deadlines",
                body: "Know what’s due (and when). Get reminders before filing windows and key reporting dates.",
                icon: <Icon.BellLg className="h-11 w-11 text-[color:rgb(var(--brand))]" />,
              },
              {
                step: "Step 3",
                title: "Keep records clean as you grow",
                body: "Organize what matters and pull defensible logs when you need them (Pro).",
                icon: <Icon.ShieldLg className="h-11 w-11 text-[color:rgb(var(--brand))]" />,
              },
            ].map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Step header centered + larger */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-semibold text-neutral-900">
                    {c.step}
                  </div>
                </div>

                {/* Icon: no background */}
                <div className="mt-7 flex justify-center">{c.icon}</div>

                <div className="mt-7 text-center">
                  <div className="text-lg font-semibold text-neutral-900">{c.title}</div>
                  <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed text-neutral-700">{c.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Replaced the line you didn’t like with brand positioning */}
          <p className="mt-8 text-center text-sm text-neutral-600">
            Built on state rules—so you can move with clarity.
          </p>
        </div>
      </section>

      {/* What you get (tightened copy) */}
      <section id="features" className="border-b border-neutral-200 bg-white">
        <div className="container py-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className={cx("text-sm font-semibold", BRAND_TEXT)}>Built for clarity.</div>
            <h2 className="mt-2 font-heading text-2xl md:text-3xl">Go from “paying helpers” to employer-ready.</h2>
            <p className="mt-3 text-neutral-700">
              Tell us your state + situation. You’ll get your setup steps, what to save, and what’s due next—without the guesswork.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {/* Feature 1 */}
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className={cx("text-sm font-semibold", BRAND_TEXT)}>Employer setup</div>
                <h3 className="mt-2 font-heading text-xl md:text-2xl">A state-ready checklist you can follow.</h3>
                <p className="mt-3 text-neutral-700">
                  Get the steps your state expects—plus a simple “save this” list so you’re covered later.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>Clear steps (no jargon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>Save confirmations + account details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>Progress tracking so nothing gets missed</span>
                  </li>
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <div className="relative p-6">
                  <div className="text-xs text-neutral-500">Placeholder: product shot / animation</div>
                  <div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${FEATURE_IMAGE_1}")` }} />
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">Drop in a screenshot, Loom poster, or a future animation frame.</div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div className="relative order-last overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 md:order-first">
                <div className="relative p-6">
                  <div className="text-xs text-neutral-500">Placeholder: reminder timeline</div>
                  <div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${FEATURE_IMAGE_2}")` }} />
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">Great spot for an “upcoming deadlines” animation or timeline UI.</div>
                </div>
              </div>

              <div>
                <div className={cx("text-sm font-semibold", BRAND_TEXT)}>Deadlines</div>
                <h3 className="mt-2 font-heading text-xl md:text-2xl">Deadlines you don’t have to remember.</h3>
                <p className="mt-3 text-neutral-700">
                  Keep wage reporting + filings visible, with reminders you can adjust—so nothing surprises you.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>Adjustable reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>Quick log of what you filed + when</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon.CheckCircleBold className={cx("mt-0.5 h-4 w-4", BRAND_TEXT)} />
                    <span>One place for state account details</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <div className={cx("text-sm font-semibold", BRAND_TEXT)}>Records (Pro)</div>
                <h3 className="mt-2 font-heading text-xl md:text-2xl">Clean records you can stand behind.</h3>
                <p className="mt-3 text-neutral-700">
                  When you’re ready, upgrade for stronger record-keeping and export-ready logs—without building a spreadsheet system.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-semibold text-neutral-900">Request proof</div>
                    <div className="mt-1 text-sm text-neutral-700">Ask for W-9s, invoices, COIs—and track what’s in.</div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-semibold text-neutral-900">Export clean logs</div>
                    <div className="mt-1 text-sm text-neutral-700">Download defensible records for advisors + filings.</div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                <div className="relative p-6">
                  <div className="text-xs text-neutral-500">Placeholder: audit export / proof vault</div>
                  <div className="mt-3 aspect-[16/10] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">Add screenshot later</div>
                  </div>
                  <div className="mt-3 text-xs text-neutral-500">Perfect for a “CSV export” or “proof vault” product shot.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing (cards aligned + no blob) */}
      <section id="pricing" className="border-y border-neutral-200 bg-neutral-50">
        <div className="container py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-heading text-2xl md:text-3xl">Start free. Upgrade when you want stronger protection.</h2>
            <p className="mt-3 text-neutral-700">Free covers setup + UI reminders. Pro adds proof tracking and export-ready logs.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 md:items-stretch">
            <PriceCard
              tone="free"
              label="FREE"
              name="Employer Ready"
              price="$0"
              blurb="Everything you need to become an employer—cleanly."
              points={[
                "State-ready employer setup checklist",
                "Save confirmations + account details",
                "UI deadlines + reminders",
                "Progress dashboard + milestones",
              ]}
              cta="Start free"
              ctaHref={GET_STARTED_HREF}
            />

            <PriceCard
              tone="pro"
              label="PRO"
              name="Audit-Ready"
              price="$39"
              subprice="/mo"
              badge="Best for staying clean as you grow"
              blurb="For record-keeping that holds up when someone asks—plus exports you can hand to an advisor."
              points={[
                "Everything in Free",
                "Proof requests + tracking (W-9s, invoices, COIs)",
                "Payee + payment clarity",
                "Exportable logs (UI + 1099 prep support)",
                "Audit-ready packet building (as coverage expands)",
              ]}
              cta="Upgrade to Pro"
              ctaHref="#pricing"
            />
          </div>

          <div className="mt-12 rounded-3xl border border-neutral-200 bg-white p-8 text-center">
            <h3 className="font-heading text-2xl">Get registered. Stay ahead. Keep it clean.</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-600">
              Start with your state checklist—then turn on reminders and keep records organized as you grow.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={GET_STARTED_HREF} className="btn btn-primary h-11 px-6">
                Start free <Icon.ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href="#how" className="btn btn-ghost h-11 px-6">
                See how it works
              </a>
            </div>
          </div>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
