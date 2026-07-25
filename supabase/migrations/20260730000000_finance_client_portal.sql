-- ============================================================
-- Ameen Haieck Studio — Financial Studio, Phase 5.
-- Per-client public portal (/client/{token}) — reuses the
-- portal_token column already reserved on finance_clients since
-- Phase 1, plus a new is_paid flag on receipts so the client can see
-- which of their receipts are settled. Same security model as the
-- existing per-receipt public page: one security-definer function is
-- the only public access path, no anon grant on any table.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- is_paid ----------
alter table public.finance_receipts
  add column if not exists is_paid boolean not null default false;

-- ---------- get_public_client_statement() ----------
-- total_due / last_payment_date mirror finance_client_summary's own
-- remaining_balance formula exactly (computed inline rather than
-- calling that authenticated-only view): sum of each project's
-- total_value, plus project-less receipts' final_total_usd, minus
-- every payment for the client regardless of whether it's tied to a
-- project. Keeping this identical to the view is deliberate — the
-- admin's Client detail page and this public statement must always
-- show the same number for the same client.
create or replace function public.get_public_client_statement(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client record;
  v_total_project_value numeric;
  v_client_invoiced numeric;
  v_total_paid numeric;
  v_last_payment_date date;
  v_result jsonb;
begin
  select id, name, name_ar
  into v_client
  from public.finance_clients
  where portal_token = p_token;

  if v_client.id is null then
    return null;
  end if;

  select coalesce(sum(total_value), 0)
  into v_total_project_value
  from public.finance_projects
  where client_id = v_client.id;

  select coalesce(sum(final_total_usd), 0)
  into v_client_invoiced
  from public.finance_receipts
  where client_id = v_client.id and project_id is null;

  select coalesce(sum(amount), 0), max(paid_at)
  into v_total_paid, v_last_payment_date
  from public.finance_payments
  where client_id = v_client.id;

  select jsonb_build_object(
    'client_id', v_client.id,
    'client_name', v_client.name,
    'client_name_ar', v_client.name_ar,
    'total_due', v_total_project_value + v_client_invoiced - v_total_paid,
    'last_payment_date', v_last_payment_date,
    'receipts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'receipt_number', r.receipt_number,
          'receipt_date', r.receipt_date,
          'final_total_usd', r.final_total_usd,
          'remaining_balance', r.remaining_balance,
          'is_paid', r.is_paid,
          'share_token', r.share_token
        )
        order by r.receipt_date desc, r.receipt_number desc
      )
      from public.finance_receipts r
      where r.client_id = v_client.id
    ), '[]'::jsonb)
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_public_client_statement(uuid) from public;
grant execute on function public.get_public_client_statement(uuid) to anon, authenticated;
