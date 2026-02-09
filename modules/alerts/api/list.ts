export async function listAlerts(companyId: string) {
  const res = await fetch("/api/alerts/list", { method: "POST", body: JSON.stringify({ companyId }) });
  return res.json();
}
