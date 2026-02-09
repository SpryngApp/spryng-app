// lib/quiz/resultTemplates.ts
// Spryng Quiz v2 — Results copy templates (no raw rule dumps)
// Tone: calm, modern SaaS, helpful. Uses “outside payroll” everywhere.
// These templates assume your evaluator returns a small, safe "assessment" object.

export type ResultTone = "high" | "medium" | "low";

export type ResultTemplate = {
  key: string;

  // UI
  headline: string;
  subhead: string;

  // Main explanation (short)
  body: string[];

  // Why we’re saying this (human, not legal)
  signalsTitle: string;
  signals: string[];

  // What to do next (actionable)
  nextTitle: string;
  nextSteps: string[];

  // Optional “what to gather” checklist
  checklistTitle?: string;
  checklist?: string[];

  // Primary CTA (button)
  primaryCtaLabel: string;
  primaryCtaAction: "create_account" | "view_steps" | "save_progress" | "email_results";

  // Secondary CTA (link)
  secondaryCtaLabel?: string;
  secondaryCtaAction?: "learn_more" | "edit_answers" | "compare_rules";

  // Footer disclaimer
  disclaimer: string;
};

// Simple placeholder interpolation: {state_name}, {state_code}, etc.
export function fill(str: string, vars: Record<string, string>) {
  return str.replace(/\{([a-z0-9_]+)\}/gi, (_, k) => vars[k] ?? `{${k}}`);
}
export function fillAll(lines: string[], vars: Record<string, string>) {
  return lines.map((l) => fill(l, vars));
}

/**
 * Base templates (pick ONE primary template per result).
 * Then optionally append CALLOUT modules based on answers.
 */
export const RESULT_TEMPLATES: Record<string, ResultTemplate> = {
  REGISTER_NOW_HIGH: {
    key: "REGISTER_NOW_HIGH",
    headline: "You may need to register as an employer in {state_name}.",
    subhead: "Based on what you shared, you’re likely at (or past) your state’s trigger point.",
    body: [
      "This doesn’t mean you did anything wrong — it usually means the state expects an employer account so your payments can be reported the way they want.",
      "Spryng can help you save the right proof, keep outside-payroll payments organized, and follow the state’s expected steps.",
    ],
    signalsTitle: "What we used from your answers",
    signals: [
      "You’ve paid helpers outside payroll recently.",
      "Your activity looks like ongoing help (not just a one-off).",
      "Your business type and helper situation commonly triggers employer registration in {state_code}.",
    ],
    nextTitle: "Next steps (fast + clear)",
    nextSteps: [
      "Create your Spryng account so we can save your quiz results and generate your {state_name} registration checklist.",
      "Gather a simple list of outside-payroll payments (who, how much, when).",
      "Set up an audit-ready folder for proof (invoices, messages, receipts, payment confirmations).",
    ],
    checklistTitle: "What to pull together (10 minutes)",
    checklist: [
      "Helper names + what they did",
      "Payment methods (cash/Venmo/Zelle/checks/apps)",
      "Approx. totals by month",
      "Any invoices, agreements, or messages",
    ],
    primaryCtaLabel: "Create my Spryng account",
    primaryCtaAction: "create_account",
    secondaryCtaLabel: "Edit my answers",
    secondaryCtaAction: "edit_answers",
    disclaimer:
      "Spryng provides general guidance based on the information you entered. For official determinations, confirm directly with {state_name}’s agency guidance.",
  },

  REGISTER_NOW_MEDIUM: {
    key: "REGISTER_NOW_MEDIUM",
    headline: "You may need to register as an employer in {state_name}.",
    subhead: "You’re close — one detail could change the result.",
    body: [
      "Some states apply different triggers depending on the type of work, how often help occurs, and your business setup.",
      "We’ll keep this simple: we’ll help you confirm the one detail that matters most and then generate your next steps.",
    ],
    signalsTitle: "What we used from your answers",
    signals: [
      "You’ve paid helpers outside payroll.",
      "Your state’s rules can vary based on business setup or category (ex: household vs general).",
      "At least one answer is currently “Not sure,” so we’re being careful.",
    ],
    nextTitle: "Next steps",
    nextSteps: [
      "Create your Spryng account so we can save your answers and ask one quick follow-up.",
      "We’ll generate a clear “Register now vs track for later” recommendation for {state_name}.",
      "If you’re not required yet, we’ll set you up to track progress automatically.",
    ],
    primaryCtaLabel: "Save my progress",
    primaryCtaAction: "save_progress",
    secondaryCtaLabel: "Edit my answers",
    secondaryCtaAction: "edit_answers",
    disclaimer:
      "Spryng provides general guidance based on your inputs. State agencies define final requirements.",
  },

  NOT_REQUIRED_TRACK: {
    key: "NOT_REQUIRED_TRACK",
    headline: "You may not need to register yet in {state_name}.",
    subhead: "But it’s smart to start tracking outside-payroll payments now — that’s where audits get messy.",
    body: [
      "Based on what you shared, you don’t look clearly “over the line” today.",
      "The win here is staying organized so if your activity increases, you can register quickly with clean records.",
    ],
    signalsTitle: "What we used from your answers",
    signals: [
      "Your recent outside-payroll activity appears limited or unclear.",
      "You may not have ongoing help across multiple weeks.",
      "Your state often expects registration only after certain thresholds are met.",
    ],
    nextTitle: "What to do next (so you stay ahead)",
    nextSteps: [
      "Create your Spryng account to save your baseline and track progress automatically.",
      "Start an audit-ready log of outside-payroll payments (even small ones).",
      "If your plans change, Spryng will guide the registration steps for {state_name}.",
    ],
    primaryCtaLabel: "Create account to track progress",
    primaryCtaAction: "create_account",
    secondaryCtaLabel: "Email me this summary",
    secondaryCtaAction: "learn_more",
    disclaimer:
      "This is general guidance based on your inputs. State rules can vary by category and facts. If you’re unsure, confirm with {state_name} guidance.",
  },

  FUTURE_HIRING: {
    key: "FUTURE_HIRING",
    headline: "Planning to hire soon? Set up your foundation now.",
    subhead: "Even before you’re required to register, good records make everything easier later.",
    body: [
      "Since you plan to bring on help in the next 3–12 months, getting organized now prevents last-minute scrambling.",
      "Spryng helps you track outside-payroll payments, store proof, and follow the state’s expected path when you’re ready.",
    ],
    signalsTitle: "What we used from your answers",
    signals: [
      "You indicated you plan to bring on help soon.",
      "Registration triggers can happen quickly once payments begin.",
      "Early setup = cleaner records and faster registration when needed.",
    ],
    nextTitle: "Next steps",
    nextSteps: [
      "Create your Spryng account so your tracking is ready before the first payment goes out.",
      "Set a simple “proof routine” (save invoices + payment confirmations).",
      "When you start paying helpers, Spryng will match your activity to {state_name}’s expectations.",
    ],
    primaryCtaLabel: "Create my account",
    primaryCtaAction: "create_account",
    secondaryCtaLabel: "Edit my answers",
    secondaryCtaAction: "edit_answers",
    disclaimer:
      "Spryng provides general guidance and tracking tools. Official requirements depend on state rules and your specific facts.",
  },

  HOUSEHOLD_SPECIAL: {
    key: "HOUSEHOLD_SPECIAL",
    headline: "Household help in {state_name} can have different trigger points.",
    subhead: "Nannies, caregivers, and household workers often follow a separate rule set.",
    body: [
      "Household categories are commonly treated differently than a typical business paying contractors.",
      "We’ll keep the guidance clear and focused on what your state expects for household help.",
    ],
    signalsTitle: "What we used from your answers",
    signals: [
      "You indicated household help (domestic category).",
      "Household thresholds and reporting expectations often differ from general business rules.",
    ],
    nextTitle: "Next steps",
    nextSteps: [
      "Create your Spryng account so we can apply the correct household rule set for {state_name}.",
      "Track what you paid outside payroll and how often help happened (by week).",
      "We’ll generate your household-ready checklist (what to track + when to register).",
    ],
    primaryCtaLabel: "Continue with household setup",
    primaryCtaAction: "create_account",
    secondaryCtaLabel: "Edit my category",
    secondaryCtaAction: "edit_answers",
    disclaimer:
      "General guidance only. Household rules vary by state and details like duties, pay method, and frequency.",
  },

  UNCLEAR_NEEDS_ONE_DETAIL: {
    key: "UNCLEAR_NEEDS_ONE_DETAIL",
    headline: "We can’t give a clean answer yet — one detail matters.",
    subhead: "Your state’s rules depend on a specific fact we still don’t have.",
    body: [
      "You’re not “blocked” — we just want to avoid giving you a confident answer based on guesswork.",
      "Answer one quick follow-up and we’ll generate a clear recommendation for {state_name}.",
    ],
    signalsTitle: "What’s missing",
    signals: [
      "Your business setup (or tax treatment) is unclear.",
      "Or: payment frequency / total is still “Not sure.”",
    ],
    nextTitle: "Next steps",
    nextSteps: [
      "Create your Spryng account so we can save your answers and ask the follow-up.",
      "Then we’ll return a simple result: “Register now” vs “Track for later,” with the why.",
    ],
    primaryCtaLabel: "Save and answer one follow-up",
    primaryCtaAction: "save_progress",
    secondaryCtaLabel: "Edit my answers",
    secondaryCtaAction: "edit_answers",
    disclaimer:
      "Spryng provides general guidance based on your inputs. State agencies define final requirements.",
  },
};

/**
 * Optional “callouts” you can attach under the main result.
 * These are NOT the main result — they’re context cards.
 */
export type Callout = {
  key: string;
  title: string;
  body: string[];
};

export const CALLOUTS: Record<string, Callout> = {
  SAME_COURSE_CORE: {
    key: "SAME_COURSE_CORE",
    title: "Because this looks like your core service…",
    body: [
      "When help is part of what you sell to customers, states often scrutinize classification more closely.",
      "Spryng can help you keep proof organized and track the right details from day one.",
    ],
  },

  SUPPORT_WORK: {
    key: "SUPPORT_WORK",
    title: "Support work can still count.",
    body: [
      "Even if it’s bookkeeping, admin, design, or marketing — paying outside payroll still creates reporting and recordkeeping expectations.",
      "The goal is clarity: who was paid, for what, and what proof supports it.",
    ],
  },

  FAMILY_PAYMENTS: {
    key: "FAMILY_PAYMENTS",
    title: "Family and friends: don’t skip this.",
    body: [
      "Many owners forget to count family/friends because it didn’t feel like “payroll.”",
      "Some states exclude certain family payments in specific setups — others don’t. We’ll apply your state’s approach once your entity details are clear.",
    ],
  },

  OWNER_MEMBER_PAYMENTS: {
    key: "OWNER_MEMBER_PAYMENTS",
    title: "Owner/member payments matter in some states.",
    body: [
      "In certain states and setups, payments to owners, officers, or members can be treated differently than contractor payments.",
      "We’ll keep the guidance simple — and focus on what your state expects to be reported and stored.",
    ],
  },

  OUTSIDE_PAYROLL_PROOF_ROUTINE: {
    key: "OUTSIDE_PAYROLL_PROOF_ROUTINE",
    title: "Your best move: a simple proof routine.",
    body: [
      "Save (1) what work was done, (2) what you paid, (3) how you paid, and (4) when it happened.",
      "Even lightweight proof is better than reconstructing everything later.",
    ],
  },
};

/**
 * Optional: email-ready snippet templates (shorter)
 */
export const EMAIL_SNIPPETS = {
  subject_register_now: "Your Spryng summary for {state_name}",
  subject_track: "Your Spryng summary: staying ahead in {state_name}",
  opener: "Here’s your Spryng summary based on what you shared:",
  footer: "— Spryng\nOutside-payroll clarity, built for busy owners.",
};

/**
 * Suggested way to pick templates (your evaluator can do this).
 * - recommendation: "register_now" | "track" | "future_hiring" | "needs_one_detail" | "household"
 * - confidence: "high" | "medium" | "low"
 */
export function pickResultTemplate(recommendation: string, confidence: ResultTone) {
  if (recommendation === "household") return RESULT_TEMPLATES.HOUSEHOLD_SPECIAL;
  if (recommendation === "future_hiring") return RESULT_TEMPLATES.FUTURE_HIRING;
  if (recommendation === "needs_one_detail") return RESULT_TEMPLATES.UNCLEAR_NEEDS_ONE_DETAIL;
  if (recommendation === "track") return RESULT_TEMPLATES.NOT_REQUIRED_TRACK;
  // default register_now
  return confidence === "high" ? RESULT_TEMPLATES.REGISTER_NOW_HIGH : RESULT_TEMPLATES.REGISTER_NOW_MEDIUM;
}
