export type Alert = { id: string; kind: string; title: string; body?: string; severity: "info"|"warn"|"critical"; created_at: string };
