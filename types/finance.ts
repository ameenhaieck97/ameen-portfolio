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
  client_id: string;
  /** Null when this receipt is attached directly to the client — the recurring-client workflow with no formal project. */
  project_id: string | null;
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
  share_token: string;
  is_paid: boolean;
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
  client_id: string;
  /** Null when this payment isn't tied to a project (recurring-client workflow). */
  project_id: string | null;
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

/** Backs the Receipt Creator's "Previous Balance" / "Last Payment Date" when NO project is selected — the client-level equivalent of FinanceProjectSummary, from the finance_client_running_balance view. */
export type FinanceClientRunningBalance = {
  client_id: string;
  remaining_balance: number;
  last_payment_date: string | null;
};

/** Shape returned by the get_public_receipt(token) RPC — backs the read-only /receipt/{token} page. Deliberately narrower than FinanceReceiptWithItems: no ids beyond the receipt/items, no client contact info. */
export type PublicReceiptItem = {
  id: string;
  service: string;
  service_ar: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type PublicReceipt = {
  id: string;
  receipt_number: number;
  receipt_date: string;
  client_name: string;
  project_name: string | null;
  subtotal: number;
  discount: number;
  previous_balance: number;
  final_total_usd: number;
  exchange_rate: number;
  final_total_iqd: number;
  amount_paid: number;
  remaining_balance: number;
  notes: string;
  notes_ar: string;
  items: PublicReceiptItem[];
};

/** One row in the get_public_client_statement(token) RPC's "receipts" array — just enough to list + link to that receipt's own /receipt/{share_token} page for full details. */
export type PublicClientReceipt = {
  id: string;
  receipt_number: number;
  receipt_date: string;
  final_total_usd: number;
  remaining_balance: number;
  is_paid: boolean;
  share_token: string;
};

/** Shape returned by the get_public_client_statement(token) RPC — backs the read-only /client/{token} page. */
export type PublicClientStatement = {
  client_id: string;
  client_name: string;
  client_name_ar: string;
  total_due: number;
  last_payment_date: string | null;
  receipts: PublicClientReceipt[];
};
