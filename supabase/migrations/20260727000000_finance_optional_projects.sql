-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 3.
-- Projects become optional: a receipt/payment must always belong
-- to a client, but only OPTIONALLY to a project. This supports
-- both one-time project work (Branding, Logo Design — where a
-- project's total_value seeds the running balance) and long-term
-- recurring clients (ISO Foam, Al-Mustafa Foundation — where
-- there's no fixed "project", just receipts issued over time).
--
-- Smallest possible change: no table is rebuilt. finance_receipts
-- and finance_payments each gain a client_id column (backfilled
-- from their existing project's client_id, so no data is lost),
-- and project_id becomes nullable with ON DELETE SET NULL instead
-- of CASCADE — deleting a project no longer deletes the receipts
-- that reference it, since a receipt's real owner is the client.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- finance_receipts: add client_id, relax project_id ----------
alter table public.finance_receipts
  add column if not exists client_id uuid references public.finance_clients (id) on delete cascade;

update public.finance_receipts r
set client_id = p.client_id
from public.finance_projects p
where r.project_id = p.id and r.client_id is null;

alter table public.finance_receipts alter column client_id set not null;

alter table public.finance_receipts drop constraint if exists finance_receipts_project_id_fkey;
alter table public.finance_receipts alter column project_id drop not null;
alter table public.finance_receipts
  add constraint finance_receipts_project_id_fkey
  foreign key (project_id) references public.finance_projects (id) on delete set null;

create index if not exists finance_receipts_client_idx on public.finance_receipts (client_id);

-- ---------- finance_payments: add client_id, relax project_id ----------
alter table public.finance_payments
  add column if not exists client_id uuid references public.finance_clients (id) on delete cascade;

update public.finance_payments pay
set client_id = p.client_id
from public.finance_projects p
where pay.project_id = p.id and pay.client_id is null;

alter table public.finance_payments alter column client_id set not null;

alter table public.finance_payments drop constraint if exists finance_payments_project_id_fkey;
alter table public.finance_payments alter column project_id drop not null;
alter table public.finance_payments
  add constraint finance_payments_project_id_fkey
  foreign key (project_id) references public.finance_projects (id) on delete set null;

create index if not exists finance_payments_client_idx on public.finance_payments (client_id);

-- ---------- finance_client_summary (updated for optional projects) ----------
-- remaining_balance = (sum of each project's total_value) + (sum of
-- client-level, project-less receipts' final_total_usd) − (all payments,
-- project-based or not). For a client with no projects, the first term is
-- 0 and this reduces to a pure running invoiced-vs-paid tally. For a
-- client whose receipts are all project-based, the second term is 0 and
-- this is exactly the same formula Phase 1 already used — no regression.
create or replace view public.finance_client_summary
with (security_invoker = true) as
with project_totals as (
  select client_id, coalesce(sum(total_value), 0) as total_project_value
  from public.finance_projects
  group by client_id
),
client_level_receipt_totals as (
  select client_id, coalesce(sum(final_total_usd), 0) as client_invoiced
  from public.finance_receipts
  where project_id is null
  group by client_id
),
payment_totals as (
  select client_id, coalesce(sum(amount), 0) as total_paid, max(paid_at) as last_payment_date
  from public.finance_payments
  group by client_id
),
receipt_counts as (
  select client_id, count(*) as receipt_count
  from public.finance_receipts
  group by client_id
)
select
  c.id as client_id,
  coalesce(pt.total_project_value, 0) as total_project_value,
  coalesce(pay.total_paid, 0) as total_paid,
  coalesce(pt.total_project_value, 0) + coalesce(clt.client_invoiced, 0) - coalesce(pay.total_paid, 0)
    as remaining_balance,
  coalesce(rc.receipt_count, 0) as receipt_count,
  pay.last_payment_date
from public.finance_clients c
left join project_totals pt on pt.client_id = c.id
left join client_level_receipt_totals clt on clt.client_id = c.id
left join payment_totals pay on pay.client_id = c.id
left join receipt_counts rc on rc.client_id = c.id;

grant select on public.finance_client_summary to authenticated;
revoke all on public.finance_client_summary from anon, public;

-- ---------- finance_client_running_balance (new) ----------
-- Backs the Receipt Creator's "Previous Balance" / "Last Payment Date"
-- fields when NO project is selected — the client-level equivalent of
-- finance_project_summary, scoped to project-less receipts/payments only.
create or replace view public.finance_client_running_balance
with (security_invoker = true) as
with receipt_totals as (
  select client_id, coalesce(sum(final_total_usd - amount_paid), 0) as remaining_balance
  from public.finance_receipts
  where project_id is null
  group by client_id
),
payment_totals as (
  select client_id, max(paid_at) as last_payment_date
  from public.finance_payments
  where project_id is null
  group by client_id
)
select
  c.id as client_id,
  coalesce(rt.remaining_balance, 0) as remaining_balance,
  pt.last_payment_date
from public.finance_clients c
left join receipt_totals rt on rt.client_id = c.id
left join payment_totals pt on pt.client_id = c.id;

grant select on public.finance_client_running_balance to authenticated;
revoke all on public.finance_client_running_balance from anon, public;

-- ---------- create_finance_receipt() — client_id required, project_id optional ----------
drop function if exists public.create_finance_receipt(
  uuid, date, jsonb, numeric, numeric, numeric, text, text
);

create or replace function public.create_finance_receipt(
  p_client_id uuid,
  p_project_id uuid,
  p_receipt_date date,
  p_items jsonb,
  p_discount numeric,
  p_exchange_rate numeric,
  p_amount_paid numeric,
  p_notes text,
  p_notes_ar text
) returns public.finance_receipts
language plpgsql
security invoker
as $$
declare
  v_previous_balance numeric;
  v_subtotal numeric;
  v_final_total_usd numeric;
  v_final_total_iqd numeric;
  v_remaining_balance numeric;
  v_receipt public.finance_receipts;
  v_item jsonb;
  v_sort_order integer := 0;
begin
  if p_project_id is not null then
    select p.total_value - coalesce(
      (select sum(amount) from public.finance_payments where project_id = p_project_id), 0
    )
    into v_previous_balance
    from public.finance_projects p
    where p.id = p_project_id and p.client_id = p_client_id;

    if v_previous_balance is null then
      raise exception 'Project % does not exist for client %', p_project_id, p_client_id;
    end if;
  else
    select coalesce(sum(final_total_usd - amount_paid), 0)
    into v_previous_balance
    from public.finance_receipts
    where client_id = p_client_id and project_id is null;
  end if;

  select coalesce(sum((item->>'unit_price')::numeric * (item->>'quantity')::numeric), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) as item;

  v_final_total_usd := v_subtotal - coalesce(p_discount, 0);
  v_final_total_iqd := v_final_total_usd * coalesce(p_exchange_rate, 0);
  v_remaining_balance := v_previous_balance + v_final_total_usd - coalesce(p_amount_paid, 0);

  insert into public.finance_receipts (
    client_id, project_id, receipt_date, previous_balance, subtotal, discount,
    final_total_usd, exchange_rate, final_total_iqd, amount_paid,
    remaining_balance, notes, notes_ar
  ) values (
    p_client_id, p_project_id, p_receipt_date, v_previous_balance, v_subtotal, coalesce(p_discount, 0),
    v_final_total_usd, coalesce(p_exchange_rate, 0), v_final_total_iqd, coalesce(p_amount_paid, 0),
    v_remaining_balance, coalesce(p_notes, ''), coalesce(p_notes_ar, '')
  )
  returning * into v_receipt;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.finance_receipt_items (
      receipt_id, service, service_ar, unit_price, quantity, line_total, sort_order
    ) values (
      v_receipt.id,
      v_item->>'service',
      coalesce(v_item->>'service_ar', ''),
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric * (v_item->>'quantity')::numeric,
      v_sort_order
    );
    v_sort_order := v_sort_order + 1;
  end loop;

  if coalesce(p_amount_paid, 0) <> 0 then
    insert into public.finance_payments (client_id, project_id, receipt_id, amount, paid_at, notes)
    values (p_client_id, p_project_id, v_receipt.id, p_amount_paid, p_receipt_date, '');
  end if;

  return v_receipt;
end;
$$;

grant execute on function public.create_finance_receipt(
  uuid, uuid, date, jsonb, numeric, numeric, numeric, text, text
) to authenticated;
