-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 4 fix.
-- IQD total on a receipt now reflects the full remaining balance
-- converted to Iraqi dinar (what the client actually still owes),
-- not just this receipt's own new charge. Only affects receipts
-- created from now on — existing receipts remain untouched,
-- preserving the immutable-snapshot principle.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

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
  v_remaining_balance := v_previous_balance + v_final_total_usd - coalesce(p_amount_paid, 0);
  -- IQD total = what's still owed (remaining_balance), not just this
  -- receipt's new charge — the useful figure to hand a client paying in IQD.
  v_final_total_iqd := v_remaining_balance * coalesce(p_exchange_rate, 0);

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
