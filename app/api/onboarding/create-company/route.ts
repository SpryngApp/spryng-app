// app/api/onboarding/create-company/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type PostgrestError } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonOk(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
function jsonErr(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

function toStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}
function upper2(v: unknown) {
  const s = toStr(v).toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : "";
}
function isUndefinedColumn(err: PostgrestError | null | undefined) {
  return err?.code === "42703";
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY");
  }
  return { url, anonKey, serviceKey };
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const { url, anonKey, serviceKey } = getEnv();

    // Capture auth cookies supabase might want to update
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
      error: userErr,
    } = await supabaseAuth.auth.getUser();

    if (userErr || !user) {
      const res = jsonErr("NOT_AUTHENTICATED", "You must be signed in to continue.", 401, userErr);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const body = (await req.json()) as Record<string, unknown>;

    const companyName = toStr(body.company_name);
    const workspaceName = toStr(body.workspace_name) || companyName;
    const stateCode = upper2(body.state_code) || null;
    const entityTypeRaw = toStr(body.entity_type_raw) || null;

    if (!companyName) {
      const res = jsonErr("BAD_INPUT", "Company name is required.", 400);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Ensure profile exists
    const { error: pErr } = await admin
      .from("profiles")
      .upsert({ id: user.id, email: user.email ?? null, full_name: null } as any, { onConflict: "id" });

    if (pErr) {
      const res = jsonErr("PROFILE_UPSERT_FAILED", "Could not prepare your profile.", 500, pErr);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    // If user already has an active workspace, reuse it (idempotent)
    const { data: prof } = await admin
      .from("profiles")
      .select("active_workspace_id")
      .eq("id", user.id)
      .maybeSingle();

    let workspace_id: string | null = (prof?.active_workspace_id as any) ?? null;

    if (!workspace_id) {
      // Create workspace (prefer owner_user_id)
      const { data: ws1, error: wsErr1 } = await admin
        .from("workspaces")
        .insert({ name: workspaceName, owner_user_id: user.id } as any)
        .select("id")
        .single();

      if (wsErr1 && isUndefinedColumn(wsErr1)) {
        const { data: ws2, error: wsErr2 } = await admin
          .from("workspaces")
          .insert({ name: workspaceName, owner_id: user.id } as any)
          .select("id")
          .single();

        if (wsErr2) {
          const res = jsonErr("WORKSPACE_CREATE_FAILED", "Could not create workspace.", 500, wsErr2);
          cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
          return res;
        }
        workspace_id = ws2.id as string;
      } else if (wsErr1) {
        const res = jsonErr("WORKSPACE_CREATE_FAILED", "Could not create workspace.", 500, wsErr1);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return res;
      } else {
        workspace_id = ws1.id as string;
      }

      // Membership (owner)
      const { error: mErr } = await admin
        .from("workspace_members")
        .upsert(
          { workspace_id, user_id: user.id, role: "owner", status: "active" } as any,
          { onConflict: "workspace_id,user_id" }
        );

      if (mErr) {
        const res = jsonErr("MEMBERSHIP_CREATE_FAILED", "Could not add you to the workspace.", 500, mErr);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return res;
      }

      // Set active workspace
      const { error: aErr } = await admin
        .from("profiles")
        .update({ active_workspace_id: workspace_id } as any)
        .eq("id", user.id);

      if (aErr) {
        const res = jsonErr("PROFILE_UPDATE_FAILED", "Could not set your active workspace.", 500, aErr);
        cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
        return res;
      }
    }

    // Employer: one per workspace (upsert on workspace_id)
    const { data: emp, error: eErr } = await admin
      .from("employers")
      .upsert(
        {
          workspace_id,
          display_name: companyName,
          state_code: stateCode,
          entity_type_raw: entityTypeRaw,
        } as any,
        { onConflict: "workspace_id" }
      )
      .select("id")
      .single();

    if (eErr) {
      const res = jsonErr("EMPLOYER_CREATE_FAILED", "Could not create company record.", 500, eErr);
      cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const employer_id = emp.id as string;

    const res = jsonOk({ workspace_id, employer_id }, 200);
    cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  } catch (e: any) {
    return jsonErr("UNHANDLED", e?.message || "Unknown error", 500);
  }
}
