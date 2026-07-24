// Financial Studio — internal admin CRM types. Kept separate from
// types/admin.ts (rather than merged in) because "Client" here means a
// paying client, a distinct concept from the public.clients partner-logo
// table admin.ts doesn't even model as its own type.

export type FinanceClient = {
  id: string;
  name: string;
  name_ar: string;
  company: string;
  company_ar: string;
  email: string;
  phone: string;
  notes: string;
  notes_ar: string;
  portal_token: string;
  created_at: string;
  updated_at: string;
};

export type FinanceProject = {
  id: string;
  client_id: string;
  name: string;
  name_ar: string;
  total_value: number;
  created_at: string;
  updated_at: string;
};

export type FinanceReceipt = {
  id: string;
  project_id: string;
  receipt_number: number;
  receipt_date: string;
  previous_balance: number;
  subtotal: number;
  discount: number;
  final_total_usd: number;
  exchange_rate: number;
  final_total_iqd: number;
  amount_paid: number;
  remaining_balance: number;
  notes: string;
  notes_ar: string;
  created_at: string;
  updated_at: string;
};

export type FinanceReceiptItem = {
  id: string;
  receipt_id: string;
  service: string;
  service_ar: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  sort_order: number;
  created_at: string;
};

export type FinancePayment = {
  id: string;
  project_id: string;
  receipt_id: string | null;
  amount: number;
  paid_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

/** Backs the client detail page's 5 summary cards — one row per client, from the finance_client_summary view. */
export type FinanceClientSummary = {
  client_id: string;
  total_project_value: number;
  total_paid: number;
  remaining_balance: number;
  receipt_count: number;
  last_payment_date: string | null;
};

/** Backs the Receipt Creator's automatic "Previous Balance" / "Last Payment Date" fields — one row per project, from the finance_project_summary view. */
export type FinanceProjectSummary = {
  project_id: string;
  client_id: string;
  total_value: number;
  total_paid: number;
  remaining_balance: number;
  last_payment_date: string | null;
};

export type FinanceReceiptWithItems = FinanceReceipt & {
  finance_receipt_items: FinanceReceiptItem[];
};
