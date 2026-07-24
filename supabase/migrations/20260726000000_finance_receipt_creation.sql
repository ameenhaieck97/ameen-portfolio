-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 2.
-- Adds the per-project rollup view the Receipt Creator reads
-- ("Previous Remaining Balance" / "Last Payment Date"), and the
-- create_finance_receipt() RPC that atomically creates a receipt,
-- its line items, and the payment it documents in one transaction
-- — the receipt-creation UI never inserts into these tables
-- directly, so a receipt can never be left half-created.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- finance_project_summary (per-project rollup) ----------
create or replace view public.finance_project_summary
with (security_invoker = true) as
select
  p.id as project_id,
  p.client_id,
  p.total_value,
  coalesce(pay.total_paid, 0) as total_paid,
  p.total_value - coalesce(pay.total_paid, 0) as remaining_balance,
  pay.last_payment_date
from public.finance_projects p
left join (
  select project_id, sum(amount) as total_paid, max(paid_at) as last_payment_date
  from public.finance_payments
  group by project_id
) pay on pay.project_id = p.id;

grant select on public.finance_project_summary to authenticated;
revoke all on public.finance_project_summary from anon, public;

-- ---------- create_finance_receipt() ----------
-- p_items shape: [{ "service": text, "service_ar": text, "unit_price": number, "quantity": number }, ...]
-- previous_balance is computed here, server-side, from the project's
-- current state at the moment of insertion — never trusted from the
-- client — so two receipts created back-to-back can never both read
-- the same stale balance.
create or replace function public.create_finance_receipt(
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
  select p.total_value - coalesce(
    (select sum(amount) from public.finance_payments where project_id = p_project_id), 0
  )
  into v_previous_balance
  from public.finance_projects p
  where p.id = p_project_id;

  if v_previous_balance is null then
    raise exception 'Project % does not exist', p_project_id;
  end if;

  select coalesce(sum((item->>'unit_price')::numeric * (item->>'quantity')::numeric), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) as item;

  v_final_total_usd := v_subtotal - coalesce(p_discount, 0);
  v_final_total_iqd := v_final_total_usd * coalesce(p_exchange_rate, 0);
  v_remaining_balance := v_previous_balance + v_final_total_usd - coalesce(p_amount_paid, 0);

  insert into public.finance_receipts (
    project_id, receipt_date, previous_balance, subtotal, discount,
    final_total_usd, exchange_rate, final_total_iqd, amount_paid,
    remaining_balance, notes, notes_ar
  ) values (
    p_project_id, p_receipt_date, v_previous_balance, v_subtotal, coalesce(p_discount, 0),
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
    insert into public.finance_payments (project_id, receipt_id, amount, paid_at, notes)
    values (p_project_id, v_receipt.id, p_amount_paid, p_receipt_date, '');
  end if;

  return v_receipt;
end;
$$;

grant execute on function public.create_finance_receipt(
  uuid, date, jsonb, numeric, numeric, numeric, text, text
) to authenticated;
