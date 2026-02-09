"use client";

import type { QuizAssessment, QuizCta } from "@/lib/quiz/types";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const { className, variant = "secondary", ...rest } = props;
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-[var(--spryng-accent)] text-white hover:opacity-95 focus-visible:ring-[var(--spryng-accent)]"
          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-400",
        className
      )}
    />
  );
}

export default function ResultView({
  assessment,
  onRestart,
  onPrimaryCta,
  onSecondaryCta,
}: {
  assessment: QuizAssessment;
  onRestart: () => void;
  onPrimaryCta: (cta: QuizCta) => void;
  onSecondaryCta?: (cta: QuizCta) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="px-5 pb-6 pt-6 sm:px-7 sm:pb-8 sm:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Result for {assessment.state_name} ({assessment.state_code})
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {assessment.headline}
            </h2>

            {assessment.subhead ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{assessment.subhead}</p>
            ) : null}
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <p className="text-xs font-semibold text-slate-700">
              Confidence: {assessment.confidence}
            </p>
          </div>
        </div>

        {/* Why + Next steps */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Why we’re saying this</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {assessment.why.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Next steps</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {assessment.next_steps.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data coverage (transparent without dumping rules) */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Data coverage</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>State registration rules</span>
              <span className="font-semibold">{assessment.data_coverage.state_registration_rules}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>Payment exclusions</span>
              <span className="font-semibold">{assessment.data_coverage.payment_exclusions}</span>
            </div>
          </div>
          {assessment.data_coverage.notes?.length ? (
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {assessment.data_coverage.notes.map((n, i) => (
                <li key={i}>• {n}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* CTAs */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="primary" onClick={() => onPrimaryCta(assessment.cta_primary)} className="sm:min-w-[220px]">
            {assessment.cta_primary.label}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {assessment.cta_secondary && onSecondaryCta ? (
              <Button onClick={() => onSecondaryCta(assessment.cta_secondary!)} className="sm:min-w-[180px]">
                {assessment.cta_secondary.label}
              </Button>
            ) : null}

            <Button onClick={onRestart} className="sm:min-w-[160px]">
              <RefreshCw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Spryng provides guidance for organization and readiness. This isn’t legal or tax advice.
        </p>
      </div>
    </div>
  );
}
