// app/api/quiz/claim/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLAIM_COOKIE = "spryng_quiz_claim";

function jsonOk(data: unknown, status = 200) {
  const payload =
    data && typeof data === "object" && !Array.isArray(data) ? data : { data };
  return NextResponse.json({ ok: true, ...(payload as any) }, { status });
}

function jsonErr(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (required for /api/quiz/claim auth check)");
  }
  return { url, anonKey, serviceKey };
}

function isUndefinedColumn(err: PostgrestError | null | undefined) {
  return err?.code === "42703";
}
function isMissingTable(err: PostgrestError | null | undefined) {
  return err?.code === "42P01";
}

export async function POST() {
  const cookieStore = await cookies();
  const claimToken = cookieStore.get(CLAIM_COOKIE)?.value || "";

  const clearCookieOn = (res: NextResponse) => {
    res.cookies.set({
      name: CLAIM_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  try {
    if (!claimToken) {
      return clearCookieOn(jsonErr("NO_CLAIM_COOKIE", "No quiz claim cookie found.", 400));
    }

    const { url, anonKey, serviceKey } = getEnv();

    // Route handler cookie wiring: capture cookies supabase wants to set
    const cookieJar: Array<{ name: string; value: string; options?: any }> = [];

    const supabaseAuth = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookieJar.push(...cookiesToSet);
        },
      },
    });

    const {
      data: { user },
      error: authErr,
    } = await supabaseAuth.auth.getUser();

    if (authErr || !user) {
      const res = jsonErr(
        "NOT_AUTHENTICATED",
        "You must be signed in to claim this quiz session.",
        401,
        authErr
      );
      // apply any auth cookie updates + clear claim cookie
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return clearCookieOn(res);
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const claimHash = sha256Hex(claimToken);
    const nowIso = new Date().toISOString();

    // Lookup session by claim_token_hash (preferred), fallback to claim_token
    let session: any = null;

    const { data: byHash, error: byHashErr } = await admin
      .from("quiz_sessions")
      .select("id,state_code,lead_name,lead_email,claimed_at,user_id,workspace_id,employer_id")
      .eq("claim_token_hash", claimHash as any)
      .maybeSingle();

    if (byHashErr && isUndefinedColumn(byHashErr)) {
      const { data: byRaw, error: byRawErr } = await admin
        .from("quiz_sessions")
        .select("id,state_code,lead_name,lead_email,claimed_at,user_id,workspace_id,employer_id")
        .eq("claim_token", claimToken as any)
        .maybeSingle();

      if (byRawErr) {
        const res = jsonErr("SESSION_LOOKUP_FAILED", "Could not lookup quiz session for claim.", 500, byRawErr);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return clearCookieOn(res);
      }
      session = byRaw;
    } else {
      if (byHashErr) {
        const res = jsonErr("SESSION_LOOKUP_FAILED", "Could not lookup quiz session for claim.", 500, byHashErr);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return clearCookieOn(res);
      }
      session = byHash;
    }

    if (!session?.id) {
      const res = jsonErr("INVALID_CLAIM", "This quiz claim token is invalid or expired.", 400);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return clearCookieOn(res);
    }

    if (session.claimed_at) {
      if (session.user_id && session.user_id === user.id) {
        const res = jsonOk(
          {
            claimed: true,
            already_claimed: true,
            session_id: session.id,
            workspace_id: session.workspace_id ?? null,
            employer_id: session.employer_id ?? null,
          },
          200
        );
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return clearCookieOn(res);
      }

      const res = jsonErr("ALREADY_CLAIMED", "This quiz session has already been claimed.", 409);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return clearCookieOn(res);
    }

    // Pull latest answers snapshot (optional)
    let latestAnswers: Record<string, unknown> | null = null;
    const { data: ansRows } = await admin
      .from("quiz_answers")
      .select("answers,created_at")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (Array.isArray(ansRows) && ansRows[0]?.answers && typeof ansRows[0].answers === "object") {
      latestAnswers = ansRows[0].answers as Record<string, unknown>;
    }

    // Reserve claim (atomic-ish)
    const { error: reserveErr } = await admin
      .from("quiz_sessions")
      .update({
        user_id: user.id,
        claimed_at: nowIso,
        // clear tokens after claim to prevent reuse
        claim_token_hash: null,
        claim_token: null,
      } as any)
      .eq("id", session.id)
      .is("claimed_at", null);

    if (reserveErr) {
      const res = jsonErr("CLAIM_UPDATE_FAILED", "Could not claim quiz session.", 500, reserveErr);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return clearCookieOn(res);
    }

    const warnings: string[] = [];

    // Ensure profile exists
    {
      const full_name =
        (typeof latestAnswers?.lead_name === "string" && (latestAnswers.lead_name as string)) ||
        session.lead_name ||
        null;

      const email = user.email || session.lead_email || null;

      const { error: profileErr } = await admin
        .from("profiles")
        .upsert({ id: user.id, full_name, email }, { onConflict: "id" });

      if (profileErr) {
        if (isMissingTable(profileErr)) warnings.push("profiles table missing (skipped profile upsert)");
        else warnings.push(`profiles upsert failed: ${profileErr.message}`);
      }
    }

    // Workspace/employer creation or reuse
    let workspace_id: string | null = session.workspace_id ?? null;
    let employer_id: string | null = session.employer_id ?? null;

    // If no workspace on session, try profile.active_workspace_id
    if (!workspace_id) {
      const { data: prof, error: profReadErr } = await admin
        .from("profiles")
        .select("active_workspace_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profReadErr && prof?.active_workspace_id) {
        workspace_id = prof.active_workspace_id as string;
      }
    }

    // If still no workspace, create one
    if (!workspace_id) {
      const wsName =
        (typeof latestAnswers?.workspace_name === "string" && (latestAnswers.workspace_name as string).trim()) ||
        (typeof latestAnswers?.business_name === "string" && (latestAnswers.business_name as string).trim()) ||
        "My workspace";

      // Prefer owner_user_id, but fall back if schema differs
      const { data: ws1, error: wsErr1 } = await admin
        .from("workspaces")
        .insert({ name: wsName, owner_user_id: user.id } as any)
        .select("id")
        .single();

      if (wsErr1 && isUndefinedColumn(wsErr1)) {
        const { data: ws2, error: wsErr2 } = await admin
          .from("workspaces")
          .insert({ name: wsName, owner_id: user.id } as any)
          .select("id")
          .single();

        if (wsErr2) {
          const res = jsonErr("WORKSPACE_CREATE_FAILED", "Could not create workspace.", 500, wsErr2);
          cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
          return clearCookieOn(res);
        }
        workspace_id = ws2.id as string;
      } else if (wsErr1) {
        const res = jsonErr("WORKSPACE_CREATE_FAILED", "Could not create workspace.", 500, wsErr1);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return clearCookieOn(res);
      } else {
        workspace_id = ws1.id as string;
      }
    }

    // Ensure membership row
    if (workspace_id) {
      const { error: memErr } = await admin
        .from("workspace_members")
        .upsert(
          { workspace_id, user_id: user.id, role: "owner", status: "active" } as any,
          { onConflict: "workspace_id,user_id" }
        );

      if (memErr) {
        warnings.push(`workspace_members upsert failed: ${memErr.message}`);
      }
    }

    // Ensure employer (1 per workspace)
    if (workspace_id && !employer_id) {
      const displayName =
        (typeof latestAnswers?.business_name === "string" && (latestAnswers.business_name as string).trim()) ||
        "My company";

      const state_code =
        (typeof latestAnswers?.state_code === "string" && (latestAnswers.state_code as string).trim().toUpperCase()) ||
        session.state_code ||
        null;

      const entity_type_raw =
        (typeof latestAnswers?.entity_type_raw === "string" && (latestAnswers.entity_type_raw as string)) || null;

      const { data: emp, error: empErr } = await admin
        .from("employers")
        .upsert(
          {
            workspace_id,
            display_name: displayName,
            state_code,
            entity_type_raw,
          } as any,
          { onConflict: "workspace_id" }
        )
        .select("id")
        .single();

      if (empErr) {
        if (isMissingTable(empErr)) warnings.push("employers table missing (skipped employer creation)");
        else {
          const res = jsonErr("EMPLOYER_CREATE_FAILED", "Could not create company record.", 500, empErr);
          cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
          return clearCookieOn(res);
        }
      } else {
        employer_id = emp.id as string;
      }
    }

    // Set active_workspace_id if missing
    if (workspace_id) {
      const { error: setActiveErr } = await admin
        .from("profiles")
        .update({ active_workspace_id: workspace_id } as any)
        .eq("id", user.id)
        .is("active_workspace_id", null);

      if (setActiveErr) {
        warnings.push(`profiles active_workspace_id update failed: ${setActiveErr.message}`);
      }
    }

    // Tie session to workspace/employer
    const { error: tieErr } = await admin
      .from("quiz_sessions")
      .update({ workspace_id: workspace_id ?? null, employer_id: employer_id ?? null } as any)
      .eq("id", session.id);

    if (tieErr) warnings.push(`quiz_sessions update failed: ${tieErr.message}`);

    const res = jsonOk(
      {
        claimed: true,
        session_id: session.id,
        workspace_id,
        employer_id,
        warnings: warnings.length ? warnings : undefined,
      },
      200
    );

    cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return clearCookieOn(res);
  } catch (e: any) {
    const res = jsonErr("UNHANDLED", e?.message || "Unknown error", 500);
    return clearCookieOn(res);
  }
}
