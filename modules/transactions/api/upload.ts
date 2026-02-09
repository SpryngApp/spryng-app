export async function uploadCsvApi(payload: {
  companyId: string; fileName: string; fileBase64: string;
}) {
  const res = await fetch("/api/transactions/upload", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return res.json();
}
