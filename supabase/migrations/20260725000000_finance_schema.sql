-- ============================================================
-- Ameen Haieck Studio — Financial Studio schema.
-- Internal admin CRM: clients, projects, receipts, receipt line
-- items, and payments. NOT part of the public portfolio site —
-- every table below is authenticated-only (no "public read"
-- policy is granted to anon anywhere in this file).
-- Run once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- ---------- finance_clients ----------
-- Distinct from the existing public.clients table (the public
-- "Partner Logos" marquee) — this is the paying-client CRM entity.
create table if not exists public.finance_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null default '',
  company text not null default '',
  company_ar text not null default '',
  email text not null default '',
  phone text not null default '',
  notes text not null default '',
  notes_ar text not null default '',
  -- Stubbed for the future public client portal (/client/{token}) —
  -- not yet read by any route or exposed via RLS to anon. Reserved
  -- now so the architecture doesn't need a breaking change later.
  portal_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- finance_projects ----------
-- total_value is the only manually-entered financial figure in the
-- whole schema — every balance below it is always derived, never
-- typed in directly.
create table if not exists public.finance_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.finance_clients (id) on delete cascade,
  name text not null,
  name_ar text not null default '',
  total_value numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- finance_receipts ----------
-- An immutable snapshot the moment it's created: previous_balance,
-- subtotal, final_total_usd/iqd, and remaining_balance are all
-- stored values, never recomputed later even if projects/payments
-- change afterward — this is what "previous receipts remain
-- immutable snapshots" means in practice.
create table if not exists public.finance_receipts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.finance_projects (id) on delete cascade,
  receipt_number integer generated always as identity,
  receipt_date date not null default current_date,
  previous_balance numeric(14, 2) not null default 0,
  subtotal numeric(14, 2) not null default 0,
  discount numeric(14, 2) not null default 0,
  final_total_usd numeric(14, 2) not null default 0,
  exchange_rate numeric(14, 4) not null default 0,
  final_total_iqd numeric(16, 2) not null default 0,
  amount_paid numeric(14, 2) not null default 0,
  remaining_balance numeric(14, 2) not null default 0,
  notes text not null default '',
  notes_ar text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- finance_receipt_items ----------
create table if not exists public.finance_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.finance_receipts (id) on delete cascade,
  service text not null,
  service_ar text not null default '',
  unit_price numeric(14, 2) not null default 0,
  quantity numeric(10, 2) not null default 1,
  line_total numeric(14, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- finance_payments ----------
-- The real ledger. receipt_id is nullable on purpose: the Receipt
-- Creator always sets it (a receipt is generated together with the
-- payment it documents), but the schema doesn't force a payment to
-- have a receipt, since "receipts are generated from payment
-- history" implies payments are the source of truth, not the other
-- way around.
create table if not exists public.finance_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.finance_projects (id) on delete cascade,
  receipt_id uuid references public.finance_receipts (id) on delete cascade,
  amount numeric(14, 2) not null default 0,
  paid_at date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists finance_projects_client_idx on public.finance_projects (client_id);
create index if not exists finance_receipts_project_idx on public.finance_receipts (project_id);
create index if not exists finance_receipt_items_receipt_idx on public.finance_receipt_items (receipt_id);
create index if not exists finance_payments_project_idx on public.finance_payments (project_id);
create index if not exists finance_payments_receipt_idx on public.finance_payments (receipt_id);

-- ---------- finance_client_summary (rollup view) ----------
-- Backs the Client detail page's 5 summary cards. Computed here
-- once, in one place, instead of every page hand-rolling the same
-- nested aggregation in JS.
create or replace view public.finance_client_summary
with (security_invoker = true) as
with project_totals as (
  select client_id, coalesce(sum(total_value), 0) as total_project_value
  from public.finance_projects
  group by client_id
),
payment_totals as (
  select fp.client_id, coalesce(sum(pay.amount), 0) as total_paid, max(pay.paid_at) as last_payment_date
  from public.finance_payments pay
  join public.finance_projects fp on fp.id = pay.project_id
  group by fp.client_id
),
receipt_counts as (
  select fp.client_id, count(fr.id) as receipt_count
  from public.finance_receipts fr
  join public.finance_projects fp on fp.id = fr.project_id
  group by fp.client_id
)
select
  c.id as client_id,
  coalesce(pt.total_project_value, 0) as total_project_value,
  coalesce(pay.total_paid, 0) as total_paid,
  coalesce(pt.total_project_value, 0) - coalesce(pay.total_paid, 0) as remaining_balance,
  coalesce(rc.receipt_count, 0) as receipt_count,
  pay.last_payment_date
from public.finance_clients c
left join project_totals pt on pt.client_id = c.id
left join payment_totals pay on pay.client_id = c.id
left join receipt_counts rc on rc.client_id = c.id;

-- security_invoker (above) makes the view enforce the querying
-- role's own RLS instead of the view owner's — without it, a view
-- silently bypasses row level security. Grants are still needed
-- separately since a view is its own relation.
grant select on public.finance_client_summary to authenticated;
revoke all on public.finance_client_summary from anon, public;

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['finance_clients', 'finance_projects', 'finance_receipts', 'finance_payments']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security ----------
-- Authenticated-only everywhere. Deliberately no "public read" grant
-- to anon on any finance table — this is private financial data,
-- unlike the rest of the CMS. The future /client/{token} portal will
-- need its own narrow, token-scoped access path, not a blanket anon
-- read policy like the public-content tables use.
do $$
declare t text;
begin
  foreach t in array array['finance_clients', 'finance_projects', 'finance_receipts', 'finance_receipt_items', 'finance_payments']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('create policy "admin full access" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
