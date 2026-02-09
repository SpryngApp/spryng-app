// lib/quiz/spryngQuizV2.ts
// Spryng Quiz v2 — UI-first question objects + server config builder
// - “outside payroll” everywhere
// - Conversational framing (not “wages”)
// - Dynamic per-state config without exposing thresholds

export const SPRYNG_QUIZ_V2_VERSION = "spryng_quiz_v2.2.0";

export type QuizOption = {
  value: string;
  label: string;
  helper?: string;
  icon?: string; // map to lucide icon names in UI
};

export type ShowIf = {
  all?: Array<{ key: string; equals: string }>;
  any?: Array<{ key: string; equals: string }>;
};

export type QuizQuestion =
  | {
      id: string;
      kind: "lead_capture";
      title: string;
      helper?: string;
      fields: Array<{
        key: string;
        type: "text" | "email" | "checkbox";
        label: string;
        placeholder?: string;
        required?: boolean;
      }>;
      ctaLabel?: string;
      analytics?: { stepName: string };
    }
  | {
      id: string;
      kind: "single_select" | "multi_select";
      title: string;
      helper?: string;
      responseKey: string;
      options: QuizOption[];
      required?: boolean;
      ui?: { layout?: "tiles" | "list"; columns?: 2 | 3 | 4 };
      showIf?: ShowIf;
      analytics?: { stepName: string };
      meta?: Record<string, unknown>;
    }
  | {
      id: string;
      kind: "range";
      title: string;
      helper?: string;
      responseKey: string;
      required?: boolean;
      ui?: { layout?: "tiles" | "list"; columns?: 2 | 3 | 4 };
      ranges: Array<{
        value: string;
        label: string;
        min?: number;
        max?: number;
        helper?: string;
        icon?: string;
      }>;
      showIf?: ShowIf;
      analytics?: { stepName: string };
      meta?: Record<string, unknown>;
    };

type RangeQuestion = Extract<QuizQuestion, { kind: "range" }>;
type RangeSpec = RangeQuestion["ranges"];

export type SpryngQuizConfigHints = {
  state_code: string;
  state_name: string;

  // coverage transparency (safe to show)
  state_rules_status: "complete" | "partial" | "missing";

  // whether we can assume a timeframe label or need to ask it
  amount_timeframe_mode: "fixed" | "ask";
  fixed_amount_timeframe: "quarter" | "year" | null;

  // whether week-count matters for this state (week-based thresholds exist)
  needs_weeks_question: boolean;
};

// ------------------------------------------------------------
// BASE questions (always local)
// ------------------------------------------------------------
export const SPRYNG_QUIZ_BASE: QuizQuestion[] = [
  {
    id: "lead_capture",
    kind: "lead_capture",
    title: "Let’s personalize this to your state.",
    helper:
      "Drop your info so we can save your progress and send your results (no spam — just your Spryng summary).",
    fields: [
      { key: "lead_name", type: "text", label: "Name", placeholder: "Your name", required: true },
      { key: "lead_email", type: "email", label: "Email", placeholder: "you@company.com", required: true },
      {
        key: "lead_consent",
        type: "checkbox",
        label: "Email me my results and next steps.",
        required: true,
      },
    ],
    ctaLabel: "Continue",
    analytics: { stepName: "Lead Capture" },
  },

  {
    id: "state",
    kind: "single_select",
    title: "Which state is your business based in?",
    helper: "We’ll use this to match the state’s registration rules and recordkeeping expectations.",
    responseKey: "state_code",
    required: true,
    ui: { layout: "list" },
    options: [
      { value: "AL", label: "Alabama" },
      { value: "AK", label: "Alaska" },
      { value: "AZ", label: "Arizona" },
      { value: "AR", label: "Arkansas" },
      { value: "CA", label: "California" },
      { value: "CO", label: "Colorado" },
      { value: "CT", label: "Connecticut" },
      { value: "DE", label: "Delaware" },
      { value: "DC", label: "District of Columbia" },
      { value: "FL", label: "Florida" },
      { value: "GA", label: "Georgia" },
      { value: "HI", label: "Hawaii" },
      { value: "ID", label: "Idaho" },
      { value: "IL", label: "Illinois" },
      { value: "IN", label: "Indiana" },
      { value: "IA", label: "Iowa" },
      { value: "KS", label: "Kansas" },
      { value: "KY", label: "Kentucky" },
      { value: "LA", label: "Louisiana" },
      { value: "ME", label: "Maine" },
      { value: "MD", label: "Maryland" },
      { value: "MA", label: "Massachusetts" },
      { value: "MI", label: "Michigan" },
      { value: "MN", label: "Minnesota" },
      { value: "MS", label: "Mississippi" },
      { value: "MO", label: "Missouri" },
      { value: "MT", label: "Montana" },
      { value: "NE", label: "Nebraska" },
      { value: "NV", label: "Nevada" },
      { value: "NH", label: "New Hampshire" },
      { value: "NJ", label: "New Jersey" },
      { value: "NM", label: "New Mexico" },
      { value: "NY", label: "New York" },
      { value: "NC", label: "North Carolina" },
      { value: "ND", label: "North Dakota" },
      { value: "OH", label: "Ohio" },
      { value: "OK", label: "Oklahoma" },
      { value: "OR", label: "Oregon" },
      { value: "PA", label: "Pennsylvania" },
      { value: "RI", label: "Rhode Island" },
      { value: "SC", label: "South Carolina" },
      { value: "SD", label: "South Dakota" },
      { value: "TN", label: "Tennessee" },
      { value: "TX", label: "Texas" },
      { value: "UT", label: "Utah" },
      { value: "VT", label: "Vermont" },
      { value: "VA", label: "Virginia" },
      { value: "WA", label: "Washington" },
      { value: "WV", label: "West Virginia" },
      { value: "WI", label: "Wisconsin" },
      { value: "WY", label: "Wyoming" },
    ],
    analytics: { stepName: "State" },
  },
];

// ------------------------------------------------------------
// POST-state questions are built dynamically by /api/quiz/config
// ------------------------------------------------------------

// Matches your requested answer schema buckets + includes $0/none
function amountRanges(): RangeSpec {
  return [
    { value: "zero", label: "$0 / none", min: 0, max: 0, icon: "Circle" },
    { value: "1_499", label: "$1–$499", min: 1, max: 499, icon: "Coins" },
    { value: "500_2000", label: "$500–$2,000", min: 500, max: 2000, icon: "Coins" },
    { value: "2000_10000", label: "$2,000–$10,000", min: 2000, max: 10000, icon: "Banknote" },
    { value: "gt_10000", label: "$10,000+", min: 10001, icon: "Banknote" },
    { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
  ];
}

export function buildSpryngPostStateQuestions(hints: SpryngQuizConfigHints): QuizQuestion[] {
  const paidHelpersGate: ShowIf = {
    any: [
      { key: "paid_helpers_outside_payroll", equals: "yes" },
      { key: "paid_helpers_outside_payroll", equals: "not_sure" },
    ],
  };

  const out: QuizQuestion[] = [
    {
      id: "industry_bucket",
      kind: "single_select",
      title: "What best describes your business?",
      helper:
        "This helps us ask the right questions (some rules change for household help, farms, and nonprofits).",
      responseKey: "employment_category",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      options: [
        { value: "general", label: "I sell products or services to customers", helper: "Most small businesses", icon: "Store" },
        { value: "domestic", label: "Household help", helper: "Nanny, caregiver, housekeeper, yard help", icon: "Home" },
        { value: "agricultural", label: "Agriculture / farm work", helper: "Farm, ranch, seasonal field work", icon: "Wheat" },
        { value: "nonprofit", label: "Nonprofit", helper: "Organization with a nonprofit structure", icon: "HeartHandshake" },
        { value: "government", label: "Government / public entity", helper: "City, county, public org", icon: "Landmark" },
        { value: "unknown", label: "Not sure", helper: "That’s okay — we’ll keep it simple", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Industry Bucket" },
    },

    {
      id: "entity_type",
      kind: "single_select",
      title: "How is your business set up?",
      helper: "This can affect how certain payments (like family help) are treated in some states.",
      responseKey: "entity_type_raw",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      options: [
        { value: "sole_prop", label: "Sole proprietor", helper: "No separate company return", icon: "User" },
        { value: "smllc", label: "Single-member LLC", helper: "One owner", icon: "Badge" },
        { value: "mmllc", label: "Multi-member LLC", helper: "Two+ owners", icon: "Users" },
        { value: "s_corp", label: "S-Corp", helper: "S corporation tax setup", icon: "Building2" },
        { value: "c_corp", label: "C-Corp", helper: "C corporation", icon: "Factory" },
        { value: "nonprofit", label: "Nonprofit", helper: "501(c)(x) etc.", icon: "Heart" },
        { value: "not_sure", label: "Not sure", helper: "We’ll still guide you", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Entity Type" },
    },

    {
      id: "smllc_tax_treatment",
      kind: "single_select",
      title: "For taxes, is your single-member LLC treated more like…?",
      helper: "This helps us apply family-payment rules correctly.",
      responseKey: "smllc_tax_treatment",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      showIf: { all: [{ key: "entity_type_raw", equals: "smllc" }] },
      options: [
        { value: "disregarded", label: "Just me (files with my personal taxes)", helper: "Often shows up like a sole proprietor", icon: "FileText" },
        { value: "s_corp", label: "An S-Corp", helper: "LLC elected S-Corp tax treatment", icon: "Building2" },
        { value: "not_sure", label: "Not sure", helper: "We’ll treat this carefully", icon: "HelpCircle" },
      ],
      analytics: { stepName: "SMLLC Tax Treatment" },
    },

    {
      id: "mmllc_tax_treatment",
      kind: "single_select",
      title: "How does your multi-member LLC file taxes most of the time?",
      helper: "This can change how certain payments are treated in some states.",
      responseKey: "mmllc_tax_treatment",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      showIf: { all: [{ key: "entity_type_raw", equals: "mmllc" }] },
      options: [
        { value: "partnership", label: "Partnership return", helper: "Separate partnership filing", icon: "FileText" },
        { value: "s_corp", label: "S-Corp", helper: "Elected S-Corp tax treatment", icon: "Building2" },
        { value: "not_sure", label: "Not sure", helper: "We’ll treat this carefully", icon: "HelpCircle" },
      ],
      analytics: { stepName: "MMLLC Tax Treatment" },
    },

    {
      id: "paid_helpers_outside_payroll",
      kind: "single_select",
      title: "Have you paid anyone to help your business outside payroll?",
      helper:
        "Include cash, Venmo/Zelle/Cash App, checks, reimbursements, or “quick payments.” Even one-time help counts.",
      responseKey: "paid_helpers_outside_payroll",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      options: [
        { value: "yes", label: "Yes", helper: "I’ve paid someone outside payroll", icon: "CheckCircle2" },
        { value: "no", label: "No", helper: "Not yet", icon: "Circle" },
        { value: "not_sure", label: "Not sure", helper: "I might have", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Outside Payroll Helpers" },
    },

    // Appears BEFORE amount (so they include it in their mental tally)
    {
      id: "who_did_you_pay",
      kind: "multi_select",
      title: "Who have you paid outside payroll? (Select all that apply)",
      helper: "This helps us handle common blind spots — especially family, friends, and owners.",
      responseKey: "who_did_you_pay",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      showIf: paidHelpersGate,
      options: [
        { value: "contractor", label: "A contractor / freelancer", helper: "Designer, VA, cleaner, tech help", icon: "UserCog" },
        { value: "family", label: "Family", helper: "Spouse, child, parent, sibling, etc.", icon: "Users" },
        { value: "friends", label: "Friends", helper: "Someone you know helping out", icon: "Smile" },
        { value: "owner_member", label: "An owner/member/officer", helper: "Including paying yourself", icon: "BadgeCheck" },
        { value: "gig_apps", label: "Apps / gig platforms", helper: "Delivery, task apps, etc.", icon: "Smartphone" },
        { value: "other", label: "Other", helper: "Anything not listed", icon: "MoreHorizontal" },
      ],
      analytics: { stepName: "Who Paid" },
    },

    {
      id: "same_course_of_business",
      kind: "single_select",
      title: "Was the help part of what you sell to customers?",
      helper:
        "Example: if you run a cleaning business and pay cleaners, that’s part of what you sell. Paying a bookkeeper usually isn’t.",
      responseKey: "same_course_of_business",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      showIf: paidHelpersGate,
      options: [
        { value: "yes_core", label: "Yes — it’s my core service", helper: "What customers pay me for", icon: "Briefcase" },
        { value: "no_support", label: "No — it’s support work", helper: "Admin, bookkeeping, design, marketing", icon: "ClipboardList" },
        { value: "both", label: "A bit of both", helper: "Depends on the person/task", icon: "Shuffle" },
        { value: "not_sure", label: "Not sure", helper: "We’ll guide you", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Same Course of Business" },
    },
  ];

  // If period is mixed/unknown for the state, ask timeframe (still no thresholds)
  if (hints.amount_timeframe_mode === "ask") {
    out.push({
      id: "paid_amount_timeframe",
      kind: "single_select",
      title: "When you think about what you’ve paid outside payroll, which timeframe is easier to estimate?",
      helper: "Pick the one you can answer most confidently — we’ll use ranges either way.",
      responseKey: "paid_amount_timeframe",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      showIf: paidHelpersGate,
      options: [
        { value: "quarter", label: "Last 3 months", helper: "Most recent quarter", icon: "CalendarDays" },
        { value: "year", label: "Last 12 months", helper: "Past year", icon: "CalendarClock" },
        { value: "not_sure", label: "Not sure", helper: "We’ll keep it simple", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Paid Amount Timeframe" },
    });

    out.push(
      {
        id: "paid_amount_range_quarter",
        kind: "range",
        title: "About how much have you paid outside payroll in the last 3 months?",
        helper: "Rough is fine. We use ranges because the exact number isn’t the goal here.",
        responseKey: "paid_amount_range",
        required: true,
        ui: { layout: "tiles", columns: 3 },
        showIf: { all: [{ key: "paid_amount_timeframe", equals: "quarter" }] },
        ranges: amountRanges(),
        analytics: { stepName: "Paid Amount (Quarter)" },
        meta: { fixed_paid_amount_timeframe: "quarter" },
      },
      {
        id: "paid_amount_range_year",
        kind: "range",
        title: "About how much have you paid outside payroll in the last 12 months?",
        helper: "Rough is fine. We use ranges because the exact number isn’t the goal here.",
        responseKey: "paid_amount_range",
        required: true,
        ui: { layout: "tiles", columns: 3 },
        showIf: { all: [{ key: "paid_amount_timeframe", equals: "year" }] },
        ranges: amountRanges(),
        analytics: { stepName: "Paid Amount (Year)" },
        meta: { fixed_paid_amount_timeframe: "year" },
      },
      {
        id: "paid_amount_range_not_sure",
        kind: "range",
        title: "About how much have you paid outside payroll recently?",
        helper: "Rough is fine — you can always refine this later.",
        responseKey: "paid_amount_range",
        required: true,
        ui: { layout: "tiles", columns: 3 },
        showIf: { all: [{ key: "paid_amount_timeframe", equals: "not_sure" }] },
        ranges: amountRanges(),
        analytics: { stepName: "Paid Amount (Unknown)" },
        meta: { fixed_paid_amount_timeframe: null },
      }
    );
  } else {
    // Fixed period → we don’t ask timeframe; we still store it internally via meta.
    const fixed = hints.fixed_amount_timeframe ?? "quarter";
    const title =
      fixed === "year"
        ? "About how much have you paid outside payroll in the last 12 months?"
        : "About how much have you paid outside payroll in the last 3 months?";

    out.push({
      id: "paid_amount_range",
      kind: "range",
      title,
      helper: "Rough is fine. We use ranges because the exact number isn’t the goal here.",
      responseKey: "paid_amount_range",
      required: true,
      ui: { layout: "tiles", columns: 3 },
      showIf: paidHelpersGate,
      ranges: amountRanges(),
      analytics: { stepName: fixed === "year" ? "Paid Amount (Fixed Year)" : "Paid Amount (Fixed Quarter)" },
      meta: { fixed_paid_amount_timeframe: fixed },
    });
  }

  // Weeks question only if this state has week-based thresholds in any category
  if (hints.needs_weeks_question) {
    out.push({
      id: "weeks_with_help",
      kind: "range",
      title: "In how many different weeks did anyone help you outside payroll?",
      helper: "Count a week if they helped even once that week.",
      responseKey: "weeks_with_help_range",
      required: true,
      ui: { layout: "tiles", columns: 3 },
      showIf: paidHelpersGate,
      ranges: [
        { value: "0", label: "0 weeks", min: 0, max: 0, icon: "Circle" },
        { value: "1_2", label: "1–2 weeks", min: 1, max: 2, icon: "Calendar" },
        { value: "3_5", label: "3–5 weeks", min: 3, max: 5, icon: "Calendar" },
        { value: "6_9", label: "6–9 weeks", min: 6, max: 9, icon: "CalendarDays" },
        { value: "10_19", label: "10–19 weeks", min: 10, max: 19, icon: "CalendarDays" },
        { value: "20_plus", label: "20+ weeks", min: 20, icon: "CalendarDays" },
      ],
      analytics: { stepName: "Weeks With Help" },
    });
  }

  out.push(
    {
      id: "hiring_next_year",
      kind: "single_select",
      title: "Do you plan to bring on help in the next 3–12 months?",
      helper: "Even if you’re not required to register yet, planning ahead keeps you audit-ready.",
      responseKey: "hiring_next_year",
      required: true,
      ui: { layout: "tiles", columns: 2 },
      options: [
        { value: "yes_3mo", label: "Yes — in the next 3 months", icon: "Timer" },
        { value: "yes_12mo", label: "Yes — within 12 months", icon: "CalendarClock" },
        { value: "maybe", label: "Maybe", icon: "HelpCircle" },
        { value: "no", label: "No", icon: "Circle" },
      ],
      analytics: { stepName: "Hiring Intent" },
    },
    {
      id: "family_friends_frequency",
      kind: "single_select",
      title: "If you pay family or friends, is it…",
      helper: "Some states treat certain family payments differently depending on your setup.",
      responseKey: "family_friends_frequency",
      required: false,
      ui: { layout: "tiles", columns: 2 },
      showIf: {
        any: [
          { key: "who_did_you_pay", equals: "family" },
          { key: "who_did_you_pay", equals: "friends" },
        ],
      },
      options: [
        { value: "regular", label: "Regular help", helper: "Weekly / monthly", icon: "Repeat" },
        { value: "occasional", label: "Occasional", helper: "A few times per year", icon: "Sparkles" },
        { value: "one_time", label: "One-time", helper: "Just once so far", icon: "Dot" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      analytics: { stepName: "Family/Friends Frequency" },
    }
  );

  return out;
}

// ------------------------------------------------------------
// Helper used by evaluator
// ------------------------------------------------------------
export function normalizeEmployerEntityType(answers: Record<string, any>) {
  const raw = answers.entity_type_raw;

  if (raw === "sole_prop") return "sole_prop_sml";
  if (raw === "s_corp") return "s_corp";
  if (raw === "c_corp") return "c_corp";
  if (raw === "nonprofit") return "nonprofit";

  if (raw === "smllc") {
    const t = answers.smllc_tax_treatment;
    if (t === "disregarded") return "sole_prop_sml";
    if (t === "s_corp") return "s_corp";
    return "unknown";
  }

  if (raw === "mmllc") {
    const t = answers.mmllc_tax_treatment;
    if (t === "partnership") return "partnership_mml";
    if (t === "s_corp") return "s_corp";
    return "unknown";
  }

  return "unknown";
}

// Optional cleanup hook before sending to /api/quiz/evaluate
export function postProcessQuizAnswers(answers: Record<string, any>) {
  const out = { ...answers };

  // Normalized entity for evaluator usage
  out.employer_entity_type = normalizeEmployerEntityType(out);

  // If they chose $0/none, force timeframe to null (your requirement)
  if (out.paid_amount_range === "zero") {
    out.paid_amount_timeframe = null;
  }

  return out;
}
