import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveActiveWorkspaceId(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  // 1) profile.active_workspace_id
  const p = await supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", userId)
    .single();

  const active = p.data?.active_workspace_id as string | null;
  if (active) return active;

  // 2) fallback: first workspace membership
  const m = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1);

  const fallback = (m.data?.[0]?.workspace_id as string | undefined) ?? null;
  if (!fallback) throw new Error("No active workspace. Please complete onboarding.");

  // Best effort: set profile active_workspace_id (nice UX)
  await supabase.from("profiles").update({ active_workspace_id: fallback }).eq("id", userId);

  return fallback;
}

export async function resolveEmployerIdForWorkspace(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<string> {
  const e = await supabase
    .from("employers")
    .select("id, state_code")
    .eq("workspace_id", workspaceId)
    .single();

  if (!e.data?.id) throw new Error("No employer found for workspace.");
  return e.data.id as string;
}

export async function resolveEmployerStateForWorkspace(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<string> {
  const e = await supabase
    .from("employers")
    .select("state_code")
    .eq("workspace_id", workspaceId)
    .single();

  const state = e.data?.state_code as string | null;
  if (!state) throw new Error("Employer state is missing.");
  return state;
}
