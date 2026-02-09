export type TransactionRow = {
  id: string;
  posted_at: string;
  raw_name: string | null;
  description_raw: string | null;
  amount: number;
  direction: "inflow" | "outflow";
};
