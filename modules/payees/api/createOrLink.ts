export async function createOrLinkPayee(payload: {
  companyId: string; transactionId: string; name: string; kind: "individual"|"business"|"unknown"; serviceProvided?: string;
}) {
  const res = await fetch("/api/payees/createOrLink", { method: "POST", body: JSON.stringify(payload) });
  return res.json();
}
