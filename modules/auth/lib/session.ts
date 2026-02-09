import { cookies } from "next/headers";

/** Replace with your real session → company selection logic */
export async function getActiveCompanyId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("company_id")?.value ?? null;
}
