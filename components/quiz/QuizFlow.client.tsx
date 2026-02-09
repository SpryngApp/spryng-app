"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import {
  SPRYNG_QUIZ_BASE,
  SPRYNG_QUIZ_V2_VERSION,
  postProcessQuizAnswers,
  type QuizQuestion,
  type SpryngQuizConfigHints,
} from "@/lib/quiz/spryngQuizV2";
import type { QuizAssessment } from "@/lib/quiz/types";
import TileGrid from "@/components/quiz/TileGrid";
import ResultView from "@/components/quiz/ResultView";
import { ArrowLeft, Loader2 } from "lucide-react";

type Answers = Record<string, unknown>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isVisible(q: QuizQuestion, answers: Answers) {
  const showIf = (q as any).showIf as
    | { all?: Array<{ key: string; equals: string }>; any?: Array<{ key: string; equals: string }> }
    | undefined;

  if (!showIf) return true;

  const getVal = (k: string) => (answers as any)[k];

  const match = (k: string, equals: string) => {
    const v = getVal(k);
    if (Array.isArray(v)) return v.includes(equals);
    return v === equals;
  };

  const allOk = showIf.all ? showIf.all.every((c) => match(c.key, c.equals)) : true;
  const anyOk = showIf.any ? showIf.any.some((c) => match(c.key, c.equals)) : true;

  if (showIf.all && showIf.any) return allOk && anyOk;
  if (showIf.all) return allOk;
  if (showIf.any) return anyOk;
  return true;
}

function isAnswered(q: QuizQuestion, answers: Answers) {
  if (q.kind === "lead_capture") {
    for (const f of q.fields ?? []) {
      if (!f.required) continue;

      const v = (answers as any)[f.key];

      if (f.type === "checkbox") {
        if (v !== true) return false;
      } else {
        if (typeof v !== "string" || v.trim().length === 0) return false;
      }
    }
    return true;
  }

  const key = q.responseKey;
  const v = (answers as any)[key];

  if (!q.required) return true;

  if (q.kind === "multi_select") return Array.isArray(v) && v.length > 0;
  if (q.kind === "single_select") return typeof v === "string" && v.length > 0;
  if (q.kind === "range") return typeof v === "string" && v.length > 0;

  return true;
}

function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }
) {
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
        rest.disabled && "cursor-not-allowed opacity-60",
        className
      )}
    />
  );
}

type ConfigOk = {
  ok: true;
  quiz_version: string;
  hints: SpryngQuizConfigHints;
  questions: QuizQuestion[];
};

type ConfigErr = { ok: false; error: string };

type ConfigResponse = ConfigOk | ConfigErr;

function isConfigOk(x: unknown): x is ConfigOk {
  const v = x as any;
  return (
    !!v &&
    v.ok === true &&
    typeof v.quiz_version === "string" &&
    typeof v.hints === "object" &&
    Array.isArray(v.questions)
  );
}

export default function QuizFlow() {
  // You can swap this to your real Spryng accent later
  const accent = "#2E5BFF";

  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);

  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [hints, setHints] = useState<SpryngQuizConfigHints | null>(null);
  const [postStateQuestions, setPostStateQuestions] = useState<QuizQuestion[] | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<QuizAssessment | null>(null);

  // Base + server-provided questions (after state)
  const allQuestions = useMemo(() => {
    return [...SPRYNG_QUIZ_BASE, ...(postStateQuestions ?? [])];
  }, [postStateQuestions]);

  const visibleQuestions = useMemo(() => {
    return allQuestions.filter((qq) => isVisible(qq, answers));
  }, [allQuestions, answers]);

  useEffect(() => {
    if (assessment) return;
    if (stepIndex > visibleQuestions.length - 1) {
      setStepIndex(Math.max(0, visibleQuestions.length - 1));
    }
  }, [visibleQuestions.length, stepIndex, assessment]);

  const q = visibleQuestions[stepIndex];

  const progress = useMemo(() => {
    if (!visibleQuestions.length) return 0;
    return Math.round(((stepIndex + 1) / visibleQuestions.length) * 100);
  }, [stepIndex, visibleQuestions.length]);

  const canContinue = q ? isAnswered(q, answers) : false;
  const isLastStep = stepIndex === visibleQuestions.length - 1;

  const cardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  // If the user changes state after config load, wipe config so we refetch
  useEffect(() => {
    const state = (answers as any).state_code;
    if (!state) return;

    const hintedState = (hints as any)?.state_code;
    if (hintedState && hintedState !== state) {
      setHints(null);
      setPostStateQuestions(null);
      setConfigError(null);
    }
  }, [(answers as any).state_code, hints]);

  function updateAnswer(key: string, value: unknown, meta?: Record<string, unknown>) {
    setAnswers((prev) => {
      const next: Answers = { ...prev, [key]: value };

      // If amount range is zero, null out timeframe (your rule)
      if (key === "paid_amount_range" && value === "zero") {
        (next as any).paid_amount_timeframe = null;
      }

      // If a question injects a fixed timeframe, store it (no separate question needed)
      if (key === "paid_amount_range") {
        const tf = meta?.fixed_paid_amount_timeframe;
        if ((tf === "quarter" || tf === "year") && value !== "zero") {
          (next as any).paid_amount_timeframe = tf;
        }
      }

      return next;
    });
  }

  function toggleMulti(key: string, value: string) {
    setAnswers((prev) => {
      const curr = Array.isArray((prev as any)[key]) ? ((prev as any)[key] as string[]) : [];
      const next = curr.includes(value) ? curr.filter((v) => v !== value) : [...curr, value];
      return { ...prev, [key]: next };
    });
  }

  async function loadConfigForState(state: string) {
    setConfigLoading(true);
    setConfigError(null);

    try {
      const res = await fetch(`/api/quiz/config?state=${encodeURIComponent(state)}`, { method: "GET" });
      const data = (await res.json().catch(() => null)) as ConfigResponse | null;

      if (!res.ok) {
        const errMsg = (data as any)?.error || `Could not load quiz configuration (${res.status}).`;
        throw new Error(errMsg);
      }

      if (!isConfigOk(data)) {
        throw new Error((data as any)?.error ?? "Could not load quiz configuration.");
      }

      // Not fatal if it differs, but helpful for debugging deployments
      // if (data.quiz_version !== SPRYNG_QUIZ_V2_VERSION) {}

      setHints(data.hints ?? null);
      setPostStateQuestions(data.questions ?? []);
      return true;
    } catch (e: any) {
      setConfigError(typeof e?.message === "string" ? e.message : "Failed to load quiz config.");
      return false;
    } finally {
      setConfigLoading(false);
    }
  }

  async function onSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const cleaned = postProcessQuizAnswers({ ...(answers as any) });

      const res = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_version: SPRYNG_QUIZ_V2_VERSION,
          hints, // optional
          answers: cleaned,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true; assessment: QuizAssessment }
        | { ok: false; error: { code?: string; message?: string } | string }
        | null;

      if (!res.ok || !data) {
        const msg =
          (data as any)?.error?.message ||
          (typeof (data as any)?.error === "string" ? (data as any).error : null) ||
          `Request failed (${res.status})`;
        throw new Error(msg);
      }

      if ((data as any).ok === true && (data as any).assessment) {
        setAssessment((data as any).assessment as QuizAssessment);
        return;
      }

      const msg =
        (data as any)?.error?.message ||
        (typeof (data as any)?.error === "string" ? (data as any).error : null) ||
        "Could not evaluate quiz.";
      throw new Error(msg);
    } catch (e: any) {
      setSubmitError(
        typeof e?.message === "string"
          ? e.message
          : "Something went wrong evaluating your quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onContinue() {
    setSubmitError(null);
    if (!q) return;

    // After state selection, load server config before proceeding
    if (q.kind !== "lead_capture" && q.responseKey === "state_code" && !postStateQuestions && !configLoading) {
      const state = (answers as any).state_code;
      if (typeof state === "string" && state.length === 2) {
        const ok = await loadConfigForState(state);
        if (!ok) return; // keep them on state step to retry
      }
    }

    if (isLastStep) return onSubmit();
    setStepIndex((i) => Math.min(visibleQuestions.length - 1, i + 1));
  }

  function onBack() {
    setSubmitError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function restart() {
    setAssessment(null);
    setSubmitting(false);
    setSubmitError(null);
    setAnswers({});
    setStepIndex(0);
    setHints(null);
    setPostStateQuestions(null);
    setConfigError(null);
  }

  if (assessment) {
    return (
      <div style={{ ["--spryng-accent" as any]: accent }}>
        <ResultView
          assessment={assessment}
          onRestart={restart}
          onPrimaryCta={(cta) => {
            if (cta.kind === "create_account") window.location.href = "/signup";
            if (cta.kind === "save_progress") window.location.href = "/signup";
            if (cta.kind === "view_steps") window.location.href = "/steps";
            if (cta.kind === "email_results") window.location.href = "/signup";
          }}
          onSecondaryCta={(cta) => {
            if (cta.kind === "create_account") window.location.href = "/signup";
            if (cta.kind === "save_progress") window.location.href = "/signup";
            if (cta.kind === "view_steps") window.location.href = "/steps";
            if (cta.kind === "email_results") window.location.href = "/signup";
          }}
        />
      </div>
    );
  }

  if (!q) return null;

  return (
    <div style={{ ["--spryng-accent" as any]: accent }}>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
        {/* Progress */}
        <div className="px-5 pt-5 sm:px-7 sm:pt-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-600">
              Step {stepIndex + 1} of {visibleQuestions.length}
            </p>
            <p className="text-xs font-medium text-slate-500">{progress}%</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[var(--spryng-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div ref={cardRef} className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7 sm:pt-8">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{q.title}</h2>
            {"helper" in q && q.helper ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{q.helper}</p>
            ) : null}
          </div>

          {/* Config errors (only relevant on state step) */}
          {q.kind !== "lead_capture" && q.responseKey === "state_code" && configError ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {configError}
              <div className="mt-2 text-xs text-amber-800">
                Try again — we only load wording + which inputs to ask (no thresholds are exposed).
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            {q.kind === "lead_capture" ? (
              <div className="grid gap-4">
                {(q.fields ?? []).map((f) => {
                  if (f.type === "checkbox") {
                    return (
                      <label
                        key={f.key}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--spryng-accent)] focus:ring-[var(--spryng-accent)]"
                          checked={(answers as any)[f.key] === true}
                          onChange={(e) => updateAnswer(f.key, e.target.checked)}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{f.label}</p>
                          <p className="mt-1 text-xs text-slate-600">We’ll only email your results and next steps.</p>
                        </div>
                      </label>
                    );
                  }

                  return (
                    <div key={f.key} className="grid gap-2">
                      <label className="text-sm font-medium text-slate-900">{f.label}</label>
                      <input
                        type={f.type === "email" ? "email" : "text"}
                        placeholder={f.placeholder}
                        value={typeof (answers as any)[f.key] === "string" ? ((answers as any)[f.key] as string) : ""}
                        onChange={(e) => updateAnswer(f.key, e.target.value)}
                        className={cx(
                          "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900",
                          "placeholder:text-slate-400 focus:border-[var(--spryng-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--spryng-accent)]/15"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            ) : q.kind === "single_select" ? (
              <TileGrid
                layout={q.ui?.layout ?? "tiles"}
                columns={q.ui?.columns ?? 2}
                options={q.options}
                value={typeof (answers as any)[q.responseKey] === "string" ? ((answers as any)[q.responseKey] as string) : ""}
                onChange={(val: string) => updateAnswer(q.responseKey, val, (q as any).meta)}
                searchable={q.responseKey === "state_code"}
                searchPlaceholder={q.responseKey === "state_code" ? "Search your state…" : undefined}
              />
            ) : q.kind === "multi_select" ? (
              <TileGrid
                layout={q.ui?.layout ?? "tiles"}
                columns={q.ui?.columns ?? 2}
                options={q.options}
                multiple
                values={Array.isArray((answers as any)[q.responseKey]) ? ((answers as any)[q.responseKey] as string[]) : []}
                onToggle={(val: string) => toggleMulti(q.responseKey, val)}
              />
            ) : q.kind === "range" ? (
              <TileGrid
                layout={q.ui?.layout ?? "tiles"}
                columns={q.ui?.columns ?? 3}
                options={q.ranges.map((r) => ({
                  value: r.value,
                  label: r.label,
                  helper: r.helper,
                  icon: r.icon,
                }))}
                value={typeof (answers as any)[q.responseKey] === "string" ? ((answers as any)[q.responseKey] as string) : ""}
                onChange={(val: string) => updateAnswer(q.responseKey, val, (q as any).meta)}
              />
            ) : null}
          </div>

          {submitError ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {submitError}
            </div>
          ) : null}

          {/* Footer controls */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" onClick={onBack} disabled={stepIndex === 0 || submitting || configLoading}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={onContinue}
              disabled={!canContinue || submitting || configLoading}
              className="sm:min-w-[180px]"
            >
              {configLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating…
                </>
              ) : isLastStep ? (
                "See my results"
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            Spryng provides guidance for organization and readiness. This isn’t legal or tax advice.
          </p>
        </div>
      </div>
    </div>
  );
}
