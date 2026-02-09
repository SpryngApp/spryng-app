export async function getUploadUrl(payload: { companyId: string; docType: string; fileName: string; payeeId?: string; }) {
  const res = await fetch("/api/documents/getUploadUrl", { method: "POST", body: JSON.stringify(payload) });
  return res.json();
}
