// lib/quiz/quizFlow.ts
// Spryng Quiz Flow (v2) — pre-login, tile-first, conversational, “outside payroll” language.
// This file defines the step order + conditional visibility + answer keys.
// UI layer should render based on `type` + `ui` hints.

export type QuizChoice = {
  value: string;
  label: string;
  helper?: string;
  icon?: string; // lucide icon name (or your icon registry key)
};

export type ShowIf =
  | { all: Array<{ key: string; op: "eq" | "neq" | "in" | "not_in"; value: any }> }
  | { any: Array<{ key: string; op: "eq" | "neq" | "in" | "not_in"; value: any }> };

export type QuizStep =
  | {
      id: string;
      type: "lead_capture";
      title: string;
      prompt: string;
      helper?: string;
      fields: Array<{
        key: "lead_name" | "lead_email";
        label: string;
        placeholder?: string;
        required: boolean;
        inputType: "text" | "email";
        helper?: string;
      }>;
      ui?: {
        layout?: "card";
        icon?: string;
      };
    }
  | {
      id: string;
      type: "state_select";
      title: string;
      prompt: string;
      helper?: string;
      answerKey: "state_code";
      ui?: {
        layout?: "search";
        icon?: string;
      };
    }
  | {
      id: string;
      type: "single_select" | "multi_select";
      title: string;
      prompt: string;
      helper?: string;
      answerKey: string;
      choices: QuizChoice[];
      required?: boolean;
      showIf?: ShowIf;
      ui?: {
        layout?: "tiles" | "list";
        columns?: 1 | 2 | 3 | 4;
        icon?: string;
      };
    }
  | {
      id: string;
      type: "amount_range";
      title: string;
      prompt: string;
      helper?: string;
      answerKey: "paid_amount_range";
      required?: boolean;
      showIf?: ShowIf;
      choices: QuizChoice[]; // includes $0
      ui?: {
        layout?: "tiles";
        columns?: 1 | 2 | 3 | 4;
        icon?: string;
      };
    };

export type QuizFlow = {
  id: string;
  version: string;
  updatedAt: string;
  steps: QuizStep[];
};

export const SPRYNG_QUIZ_FLOW_V2: QuizFlow = {
  id: "spryng-quiz",
  version: "2.0.0",
  updatedAt: "2026-02-05",
  steps: [
    // 0) Lead capture (pre-login)
    {
      id: "lead_capture",
      type: "lead_capture",
      title: "Let’s personalize this",
      prompt: "Where should we send your results?",
      helper:
        "We’ll use this to save your progress and send your next steps. No spam—ever.",
      fields: [
        {
          key: "lead_name",
          label: "First name",
          placeholder: "Kris",
          required: true,
          inputType: "text",
        },
        {
          key: "lead_email",
          label: "Email",
          placeholder: "you@company.com",
          required: true,
          inputType: "email",
          helper: "We’ll email your results + a simple checklist.",
        },
      ],
      ui: { layout: "card", icon: "Mail" },
    },

    // 1) State
    {
      id: "state",
      type: "state_select",
      title: "Start with your state",
      prompt: "Which state is your business operating in?",
      helper:
        "We’ll tailor your questions and your “do I need to register?” result to this state.",
      answerKey: "state_code",
      ui: { layout: "search", icon: "MapPin" },
    },

    // 2) Industry (high-level, for tone + future branching)
    {
      id: "industry",
      type: "single_select",
      title: "Your industry",
      prompt: "What best describes your business?",
      helper: "Pick the closest match—you can change this later.",
      answerKey: "industry",
      required: true,
      choices: [
        { value: "professional_services", label: "Professional services", helper: "Consulting, coaching, design, accounting", icon: "Briefcase" },
        { value: "home_services", label: "Home services", helper: "Cleaning, painting, lawn care, handyman", icon: "Home" },
        { value: "beauty_wellness", label: "Beauty & wellness", helper: "Hair, nails, skincare, fitness, massage", icon: "Sparkles" },
        { value: "construction", label: "Construction / trades", helper: "Construction, roofing, electrical, plumbing", icon: "HardHat" },
        { value: "trucking_transport", label: "Trucking / transport", helper: "Dispatch, drivers, logistics", icon: "Truck" },
        { value: "retail_ecom", label: "Retail / eCommerce", helper: "Products, online store, pop-ups", icon: "ShoppingBag" },
        { value: "food_hospitality", label: "Food / hospitality", helper: "Catering, food service, events", icon: "Utensils" },
        { value: "real_estate", label: "Real estate", helper: "Agents, teams, property services", icon: "Building2" },
        { value: "nonprofit", label: "Nonprofit", helper: "Charity or 501(c) org", icon: "HeartHandshake" },
        { value: "other", label: "Something else", icon: "Shapes" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "LayoutGrid" },
    },

    // 3) Entity type (simple)
    {
      id: "entity_type",
      type: "single_select",
      title: "Business setup",
      prompt: "How is your business set up today?",
      helper:
        "This helps us handle edge cases—like family payments and owner rules.",
      answerKey: "entity_type",
      required: true,
      choices: [
        { value: "sole_prop", label: "Sole proprietor", helper: "No LLC (or you’re not sure)", icon: "User" },
        { value: "llc_single", label: "Single-member LLC", helper: "One owner", icon: "UserRound" },
        { value: "llc_multi", label: "Multi-member LLC", helper: "Two+ owners", icon: "Users" },
        { value: "s_corp", label: "S-Corp", icon: "BadgeCheck" },
        { value: "c_corp", label: "C-Corp", icon: "Landmark" },
        { value: "nonprofit", label: "Nonprofit", icon: "HeartHandshake" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "Building" },
    },

    // 3b) LLC tax treatment follow-up (only for LLC single/multi)
    {
      id: "llc_tax_treatment",
      type: "single_select",
      title: "Quick follow-up",
      prompt: "For taxes, how is your LLC treated?",
      helper:
        "This matters for a few state “family payment” and owner rules. If you’re not sure, pick Not sure.",
      answerKey: "llc_tax_treatment",
      required: true,
      showIf: {
        any: [
          { key: "entity_type", op: "eq", value: "llc_single" },
          { key: "entity_type", op: "eq", value: "llc_multi" },
        ],
      },
      choices: [
        {
          value: "default",
          label: "Default (no election)",
          helper:
            "Single-member: usually Schedule C. Multi-member: usually partnership.",
          icon: "FileText",
        },
        { value: "s_corp_election", label: "S-Corp election", icon: "BadgeCheck" },
        { value: "c_corp_election", label: "C-Corp election", icon: "Landmark" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "Receipt" },
    },

    // 4) Paid helpers outside payroll (entry point)
    {
      id: "paid_helpers",
      type: "single_select",
      title: "Outside-payroll help",
      prompt:
        "Have you paid anyone to help your business outside payroll?",
      helper:
        "Think: Venmo/Cash App/Zelle/checks/cash—contractors, casual help, one-offs.",
      answerKey: "paid_helpers_outside_payroll",
      required: true,
      choices: [
        { value: "yes", label: "Yes", icon: "CheckCircle2" },
        { value: "no", label: "No (not yet)", icon: "Circle" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 3, icon: "Wallet" },
    },

    // 5) Family/friends BEFORE amount step (your request)
    {
      id: "paid_family_friends",
      type: "single_select",
      title: "Include everyone",
      prompt:
        "Have you ever paid family or friends to help with your business?",
      helper:
        "Even informal payments count here—if money left your business for help, include it.",
      answerKey: "paid_family_friends",
      required: true,
      showIf: {
        any: [
          { key: "paid_helpers_outside_payroll", op: "eq", value: "yes" },
          { key: "paid_helpers_outside_payroll", op: "eq", value: "not_sure" },
        ],
      },
      choices: [
        { value: "yes", label: "Yes", icon: "Users" },
        { value: "no", label: "No", icon: "UserMinus" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 3, icon: "Users2" },
    },

    // 5b) Who did you pay? (only if yes)
    {
      id: "family_relationships",
      type: "multi_select",
      title: "Who was it?",
      prompt: "Who did you pay? (Select all that apply)",
      helper:
        "We ask because some states treat certain family relationships differently.",
      answerKey: "family_relationships",
      required: false,
      showIf: {
        all: [
          { key: "paid_family_friends", op: "eq", value: "yes" },
        ],
      },
      choices: [
        { value: "spouse", label: "Spouse", icon: "Heart" },
        { value: "child", label: "Child", icon: "Baby" },
        { value: "parent", label: "Parent", icon: "User" },
        { value: "sibling", label: "Sibling", icon: "Users" },
        { value: "other_family", label: "Other family", icon: "UsersRound" },
        { value: "friend", label: "Friend", icon: "Handshake" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "UserSearch" },
    },

    // 6) Same course of business (right after helpers + family)
    {
      id: "same_course_business",
      type: "single_select",
      title: "What kind of help was it?",
      prompt:
        "Was the help they provided part of what you sell to customers?",
      helper:
        "Example: a cleaning company paying cleaners = “Yes.” A cleaning company paying a logo designer = “No.”",
      answerKey: "same_course_of_business",
      required: true,
      showIf: {
        any: [
          { key: "paid_helpers_outside_payroll", op: "eq", value: "yes" },
          { key: "paid_helpers_outside_payroll", op: "eq", value: "not_sure" },
        ],
      },
      choices: [
        { value: "yes", label: "Yes", helper: "They do the core service/product work", icon: "BadgeCheck" },
        { value: "no", label: "No", helper: "Support/side work (design, admin, etc.)", icon: "Layers" },
        { value: "mix", label: "A mix of both", icon: "Shuffle" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "Boxes" },
    },

    // 7) Amount paid (outside payroll) — includes $0
    {
      id: "amount_paid",
      type: "amount_range",
      title: "Rough total",
      prompt:
        "About how much have you paid people to help your business outside payroll?",
      helper:
        "Include any family/friend payments too. Even if you don’t call it “wages,” if money left your business to pay for help, count it.",
      answerKey: "paid_amount_range",
      required: true,
      showIf: {
        any: [
          { key: "paid_helpers_outside_payroll", op: "eq", value: "yes" },
          { key: "paid_helpers_outside_payroll", op: "eq", value: "not_sure" },
        ],
      },
      choices: [
        { value: "zero", label: "$0 (none yet)", icon: "CircleDollarSign" },
        { value: "1_499", label: "$1–$499", icon: "DollarSign" },
        { value: "500_2000", label: "$500–$2,000", icon: "DollarSign" },
        { value: "2000_10000", label: "$2,000–$10,000", icon: "DollarSign" },
        { value: "gt_10000", label: "$10,000+", icon: "DollarSign" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "Receipt" },
    },

    // 8) Timeframe (skip if $0)
    {
      id: "amount_timeframe",
      type: "single_select",
      title: "Time window",
      prompt: "What time period does that best describe?",
      helper:
        "Some state rules look at a quarter, others look at a year—we’ll interpret it for you.",
      answerKey: "paid_amount_timeframe",
      required: false,
      showIf: {
        all: [
          { key: "paid_helpers_outside_payroll", op: "in", value: ["yes", "not_sure"] },
          { key: "paid_amount_range", op: "not_in", value: ["zero"] },
        ],
      },
      choices: [
        { value: "last_30_days", label: "Last 30 days", icon: "CalendarDays" },
        { value: "this_quarter", label: "Last 3 months (quarter)", icon: "CalendarRange" },
        { value: "last_12_months", label: "Last 12 months", icon: "Calendar" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "Clock" },
    },

    // 9) Hiring intent (also asked when they haven’t paid anyone yet)
    {
      id: "hiring_intent",
      type: "single_select",
      title: "Looking ahead",
      prompt:
        "Do you expect to pay for help in the next few months to a year?",
      helper:
        "Even if you’re not required to register yet, we can help you track progress and stay ready.",
      answerKey: "hiring_intent",
      required: true,
      choices: [
        { value: "no", label: "No", icon: "Circle" },
        { value: "0_3_months", label: "Yes — within 0–3 months", icon: "CalendarClock" },
        { value: "3_6_months", label: "Yes — within 3–6 months", icon: "CalendarRange" },
        { value: "6_12_months", label: "Yes — within 6–12 months", icon: "Calendar" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "TrendingUp" },
    },

    // 10) Optional: lightweight “control” signal (keeps it conversational)
    // Keep this last so the quiz never feels like a classification test.
    {
      id: "work_direction",
      type: "single_select",
      title: "One last thing",
      prompt:
        "When you pay for help, are you usually directing how/when the work gets done?",
      helper:
        "Just a quick signal—we’ll use it to shape your next-step guidance (not to judge you).",
      answerKey: "work_direction_signal",
      required: false,
      showIf: {
        any: [
          { key: "paid_helpers_outside_payroll", op: "eq", value: "yes" },
          { key: "paid_helpers_outside_payroll", op: "eq", value: "not_sure" },
          { key: "hiring_intent", op: "neq", value: "no" },
        ],
      },
      choices: [
        { value: "mostly_yes", label: "Yes, usually", icon: "CheckCircle2" },
        { value: "mostly_no", label: "No, they decide", icon: "UserCheck" },
        { value: "mix", label: "A mix", icon: "Shuffle" },
        { value: "not_sure", label: "Not sure", icon: "HelpCircle" },
      ],
      ui: { layout: "tiles", columns: 2, icon: "SlidersHorizontal" },
    },
  ],
};
