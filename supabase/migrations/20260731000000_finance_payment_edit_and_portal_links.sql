-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 6.
-- 1. update_receipt_payment(): lets the Studio edit a receipt's
--    "Amount paid" after the fact (a receipt is often only partially
--    paid at creation time, with the rest settled later) while
--    keeping the ledger consistent: the edited receipt's own
--    remaining_balance is recomputed, every LATER receipt in the
--    same balance chain (same client, same project — or the same
--    client's project-less receipts) has its previous_balance /
--    remaining_balance shifted by the same delta, and the linked
--    finance_payments row is kept in sync (that table, not
--    receipts.amount_paid, is what total_paid/total_due are computed
--    from everywhere else). All in one transaction, so a partial
--    write can't happen.
-- 2. get_public_receipt() gains client_portal_token in its return
--    value, so the public receipt page can link back to that
--    client's full statement.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- update_receipt_payment() ----------
create or replace function public.update_receipt_payment(p_receipt_id uuid, p_amount_paid numeric)
returns public.finance_receipts
language plpgsql
security invoker
as $$
declare
  v_receipt public.finance_receipts;
  v_delta numeric;
  v_new_amount_paid numeric;
  v_new_remaining numeric;
  v_payment_id uuid;
begin
  select * into v_receipt from public.finance_receipts where id = p_receipt_id;
  if v_receipt.id is null then
    raise exception 'Receipt % not found', p_receipt_id;
  end if;

  v_new_amount_paid := coalesce(p_amount_paid, 0);
  v_delta := v_new_amount_paid - v_receipt.amount_paid;
  v_new_remaining := v_receipt.previous_balance + v_receipt.final_total_usd - v_new_amount_paid;

  update public.finance_receipts
  set amount_paid = v_new_amount_paid,
      remaining_balance = v_new_remaining
  where id = p_receipt_id;

  if v_delta <> 0 then
    update public.finance_receipts
    set previous_balance = previous_balance - v_delta,
        remaining_balance = remaining_balance - v_delta
    where client_id = v_receipt.client_id
      and project_id is not distinct from v_receipt.project_id
      and (receipt_date, receipt_number) > (v_receipt.receipt_date, v_receipt.receipt_number);
  end if;

  select id into v_payment_id from public.finance_payments where receipt_id = p_receipt_id limit 1;
  if v_payment_id is not null then
    update public.finance_payments set amount = v_new_amount_paid where id = v_payment_id;
  elsif v_new_amount_paid <> 0 then
    insert into public.finance_payments (client_id, project_id, receipt_id, amount, paid_at, notes)
    values (v_receipt.client_id, v_receipt.project_id, p_receipt_id, v_new_amount_paid, v_receipt.receipt_date, '');
  end if;

  select * into v_receipt from public.finance_receipts where id = p_receipt_id;
  return v_receipt;
end;
$$;

grant execute on function public.update_receipt_payment(uuid, numeric) to authenticated;

-- ---------- get_public_receipt(): add client_portal_token ----------
create or replace function public.get_public_receipt(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', r.id,
    'receipt_number', r.receipt_number,
    'receipt_date', r.receipt_date,
    'client_name', c.name,
    'client_portal_token', c.portal_token,
    'project_name', p.name,
    'subtotal', r.subtotal,
    'discount', r.discount,
    'previous_balance', r.previous_balance,
    'final_total_usd', r.final_total_usd,
    'exchange_rate', r.exchange_rate,
    'final_total_iqd', r.final_total_iqd,
    'amount_paid', r.amount_paid,
    'remaining_balance', r.remaining_balance,
    'is_paid', r.is_paid,
    'notes', r.notes,
    'notes_ar', r.notes_ar,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'service', i.service,
          'service_ar', i.service_ar,
          'unit_price', i.unit_price,
          'quantity', i.quantity,
          'line_total', i.line_total
        )
        order by i.sort_order
      )
      from public.finance_receipt_items i
      where i.receipt_id = r.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.finance_receipts r
  join public.finance_clients c on c.id = r.client_id
  left join public.finance_projects p on p.id = r.project_id
  where r.share_token = p_token;

  return v_result;
end;
$$;

revoke all on function public.get_public_receipt(uuid) from public;
grant execute on function public.get_public_receipt(uuid) to anon, authenticated;
