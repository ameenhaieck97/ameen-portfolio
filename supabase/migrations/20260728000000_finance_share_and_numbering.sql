-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 4.
-- Receipt numbering restart, per-receipt public share tokens, and
-- a security-definer function backing the read-only public receipt
-- page (/receipt/{token}) — no anon SELECT grant is added to any
-- table; the function is the ONLY public access path, and it only
-- ever returns the single receipt matching the given token.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- receipt numbering ----------
-- Existing receipts (#0001, #0002, ...) keep their numbers — only the
-- NEXT one generated changes. Postgres names the identity sequence
-- backing a `generated always as identity` column <table>_<column>_seq.
alter sequence public.finance_receipts_receipt_number_seq restart with 20261027;

-- ---------- share_token ----------
alter table public.finance_receipts
  add column if not exists share_token uuid not null default gen_random_uuid() unique;

-- ---------- get_public_receipt() ----------
-- security definer: runs as the function owner, bypassing RLS
-- internally, since anon has no direct table grants at all — the
-- function itself is the narrowing (exactly one row, matched by an
-- unguessable token, nothing else reachable through it).
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
    'project_name', p.name,
    'subtotal', r.subtotal,
    'discount', r.discount,
    'previous_balance', r.previous_balance,
    'final_total_usd', r.final_total_usd,
    'exchange_rate', r.exchange_rate,
    'final_total_iqd', r.final_total_iqd,
    'amount_paid', r.amount_paid,
    'remaining_balance', r.remaining_balance,
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
