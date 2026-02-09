export const fmtMoney = (n: number, c = "USD") =>
  Number(n).toLocaleString(undefined, { style: "currency", currency: c });
