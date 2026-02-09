// lib/quiz/types.ts
// Single source of truth for quiz input + evaluator output types.

export type QuizRecommendation =
  | "register_now"
  | "track_for_later"
  | "needs_one_detail"
  | "household_path"
  | "not_supported_yet";

export type Confidence = "high" | "medium" | "low";

export type QuizCta =
  | { kind: "create_account"; label: string }
  | { kind: "save_progress"; label: string }
  | { kind: "view_steps"; label: string }
  | { kind: "email_results"; label: string };

export type QuizCalloutKey =
  | "FAMILY_PAYMENTS"
  | "OWNER_MEMBER_PAYMENTS"
  | "SAME_COURSE_CORE"
  | "OUTSIDE_PAYROLL_PROOF_ROUTINE";

export type DataCoverage = {
  state_registration_rules: "complete" | "partial" | "missing";
  payment_exclusions: "complete" | "partial" | "missing";
  notes?: string[];
};

// -------------------------
// Quiz INPUT (answers)
// -------------------------

export type EmploymentCategory =
  | "general"
  | "domestic"
  | "agricultural"
  | "nonprofit"
  | "government"
  | "unknown";

export type EmployerEntitySelection =
  | "sole_prop"
  | "smllc"
  | "mmllc"
  | "s_corp"
  | "c_corp"
  | "nonprofit"
  | "not_sure";

export type SmllcTaxTreatment = "disregarded" | "s_corp" | "not_sure";
export type MmllcTaxTreatment = "partnership" | "s_corp" | "not_sure";

export type PaidHelpersOutsidePayroll = "yes" | "no" | "not_sure";

export type PaidAmountRange =
  | "zero"
  | "1_499"
  | "500_2000"
  | "2000_10000"
  | "gt_10000"
  | "not_sure";

export type PaidAmountTimeframe =
  | "last_30_days"
  | "this_quarter"
  | "last_12_months"
  | "not_sure";

export type SameCourseOfBusiness =
  | "yes_core"
  | "no_support"
  | "both"
  | "not_sure";

export type FamilyRelationship =
  | "spouse"
  | "child"
  | "parent"
  | "sibling"
  | "other_family"
  | "friend"
  | "not_sure";

export type WeeksWithHelpRange = "0" | "1_2" | "3_5" | "6_9" | "10_19" | "20_plus";

export type HiringIntent = "yes_3mo" | "yes_12mo" | "maybe" | "no";

export type QuizAnswers = {
  // lead capture
  lead_name?: string;
  lead_email?: string;
  lead_consent?: boolean;

  // core context
  state_code: string;
  employment_category: EmploymentCategory;

  entity_type_raw: EmployerEntitySelection;
  smllc_tax_treatment?: SmllcTaxTreatment;
  mmllc_tax_treatment?: MmllcTaxTreatment;

  // outside payroll
  paid_helpers_outside_payroll: PaidHelpersOutsidePayroll;

  // your new ordering: family/friends before amount
  paid_family_or_friends?: "yes" | "no" | "not_sure";
  family_relationships?: FamilyRelationship[];

  who_else_did_you_pay?: Array<"contractor" | "owner_member" | "gig_apps" | "other">;

  same_course_of_business?: SameCourseOfBusiness;

  paid_amount_range?: PaidAmountRange;

  // IMPORTANT: should be null when paid_amount_range === "zero"
  paid_amount_timeframe?: PaidAmountTimeframe | null;

  weeks_with_help_range?: WeeksWithHelpRange;

  // planning / lead capture value
  hiring_next_year: HiringIntent;

  // optional nuance
  family_friends_frequency?: "regular" | "occasional" | "one_time" | "not_sure";
};

// -------------------------
// Evaluator OUTPUT (assessment)
// -------------------------

export type QuizAssessment = {
  assessment_id: string; // uuid
  state_code: string;
  state_name: string;

  recommendation: QuizRecommendation;
  confidence: Confidence;

  headline: string;
  subhead?: string;

  why: string[];
  next_steps: string[];

  missing_inputs?: Array<{
    key:
      | "entity_tax_treatment"
      | "payment_frequency"
      | "total_paid_range"
      | "household_vs_business"
      | "same_course_of_business"
      | "helper_relationship"
      | "payee_is_owner";
    prompt: string;
    choices?: { value: string; label: string }[];
  }>;

  callouts?: QuizCalloutKey[];

  cta_primary: QuizCta;
  cta_secondary?: QuizCta;

  data_coverage: DataCoverage;

  evaluator_version: string;
  created_at: string; // ISO
};
