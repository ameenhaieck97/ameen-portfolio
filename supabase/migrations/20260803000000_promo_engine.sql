-- ============================================================
-- Promo engine v2: redesigns the offers/packages tables added in
-- 20260802000000 into the full flexible model (discount types,
-- schedules, accent colors, package feature checklists, a
-- popup rules engine, and lightweight analytics).
--
-- Written to run standalone even if 20260802000000 was never applied
-- (every CREATE/ADD is IF NOT EXISTS), and idempotent if re-run.
-- Run once in the Supabase SQL Editor.
-- ============================================================

-- ---------- drop old policies first ----------
-- The v1 "public read" policy (from 20260802000000) reads `published`, which
-- this migration drops below — Postgres refuses to drop a column a policy
-- depends on, so the policies must go first and get recreated at the end
-- against the new `status` column.
do $$
declare t text;
begin
  foreach t in array array['offers', 'packages']
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      execute format('drop policy if exists "admin full access" on public.%I', t);
      execute format('drop policy if exists "public read" on public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- offers ----------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid()
);

alter table public.offers add column if not exists name text not null default '';
alter table public.offers add column if not exists name_ar text not null default '';
alter table public.offers add column if not exists offer_type text not null default 'percentage';
alter table public.offers add column if not exists offer_value text not null default '';
alter table public.offers add column if not exists description text not null default '';
alter table public.offers add column if not exists description_ar text not null default '';
alter table public.offers add column if not exists image_url text not null default '';
alter table public.offers add column if not exists accent_color text not null default '#EEDF7A';
alter table public.offers add column if not exists cta_text text not null default '';
alter table public.offers add column if not exists cta_text_ar text not null default '';
alter table public.offers add column if not exists cta_link text not null default '';
alter table public.offers add column if not exists start_date date;
alter table public.offers add column if not exists end_date date;
alter table public.offers add column if not exists status text not null default 'draft';
alter table public.offers add column if not exists expiration_action text not null default 'hide';
alter table public.offers add column if not exists show_as_popup boolean not null default false;
alter table public.offers add column if not exists sort_order integer not null default 0;
alter table public.offers add column if not exists created_at timestamptz not null default now();
alter table public.offers add column if not exists updated_at timestamptz not null default now();

-- Migrate data from the v1 shape (if it's actually present) before dropping it.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'offers' and column_name = 'title') then
    update public.offers set name = title where name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'offers' and column_name = 'title_ar') then
    update public.offers set name_ar = title_ar where name_ar = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'offers' and column_name = 'link_url') then
    update public.offers set cta_link = link_url where cta_link = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'offers' and column_name = 'published') then
    update public.offers set status = 'published' where published = true and status = 'draft';
  end if;
end $$;

alter table public.offers drop column if exists title;
alter table public.offers drop column if exists title_ar;
alter table public.offers drop column if exists price;
alter table public.offers drop column if exists price_ar;
alter table public.offers drop column if exists link_url;
alter table public.offers drop column if exists published;

alter table public.offers drop constraint if exists offers_offer_type_check;
alter table public.offers add constraint offers_offer_type_check
  check (offer_type in ('percentage', 'fixed', 'free_service', 'limited', 'announcement'));
alter table public.offers drop constraint if exists offers_status_check;
alter table public.offers add constraint offers_status_check
  check (status in ('draft', 'published'));
alter table public.offers drop constraint if exists offers_expiration_action_check;
alter table public.offers add constraint offers_expiration_action_check
  check (expiration_action in ('hide', 'archive', 'keep_visible'));

-- ---------- packages ----------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid()
);

alter table public.packages add column if not exists name text not null default '';
alter table public.packages add column if not exists name_ar text not null default '';
alter table public.packages add column if not exists short_description text not null default '';
alter table public.packages add column if not exists short_description_ar text not null default '';
alter table public.packages add column if not exists full_description text not null default '';
alter table public.packages add column if not exists full_description_ar text not null default '';
alter table public.packages add column if not exists image_url text not null default '';
alter table public.packages add column if not exists accent_color text not null default '#EEDF7A';
alter table public.packages add column if not exists price numeric(10, 2) not null default 0;
alter table public.packages add column if not exists currency text not null default 'USD';
alter table public.packages add column if not exists billing_period text not null default 'one_time';
alter table public.packages add column if not exists execution_time text not null default '';
alter table public.packages add column if not exists revisions text not null default '';
alter table public.packages add column if not exists badge text not null default '';
alter table public.packages add column if not exists is_primary boolean not null default false;
alter table public.packages add column if not exists show_as_popup boolean not null default false;
alter table public.packages add column if not exists status text not null default 'draft';
alter table public.packages add column if not exists sort_order integer not null default 0;
alter table public.packages add column if not exists created_at timestamptz not null default now();
alter table public.packages add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'packages' and column_name = 'title') then
    update public.packages set name = title where name = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'packages' and column_name = 'title_ar') then
    update public.packages set name_ar = title_ar where name_ar = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'packages' and column_name = 'description') then
    update public.packages set short_description = description where short_description = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'packages' and column_name = 'description_ar') then
    update public.packages set short_description_ar = description_ar where short_description_ar = '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'packages' and column_name = 'published') then
    update public.packages set status = 'published' where published = true and status = 'draft';
  end if;
end $$;

alter table public.packages drop column if exists title;
alter table public.packages drop column if exists title_ar;
alter table public.packages drop column if exists description;
alter table public.packages drop column if exists description_ar;
alter table public.packages drop column if exists price_ar;
alter table public.packages drop column if exists link_url;
alter table public.packages drop column if exists published;

alter table public.packages drop constraint if exists packages_currency_check;
alter table public.packages add constraint packages_currency_check
  check (currency in ('USD', 'IQD'));
alter table public.packages drop constraint if exists packages_billing_period_check;
alter table public.packages add constraint packages_billing_period_check
  check (billing_period in ('one_time', 'monthly'));
alter table public.packages drop constraint if exists packages_status_check;
alter table public.packages add constraint packages_status_check
  check (status in ('draft', 'published'));

-- ---------- package_features ----------
create table if not exists public.package_features (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  label text not null,
  label_ar text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- promo_events (analytics) ----------
create table if not exists public.promo_events (
  id uuid primary key default gen_random_uuid(),
  item_kind text not null,
  item_id uuid not null,
  event_type text not null,
  created_at timestamptz not null default now()
);

alter table public.promo_events drop constraint if exists promo_events_item_kind_check;
alter table public.promo_events add constraint promo_events_item_kind_check
  check (item_kind in ('offers', 'packages'));
alter table public.promo_events drop constraint if exists promo_events_event_type_check;
alter table public.promo_events add constraint promo_events_event_type_check
  check (event_type in ('view', 'popup_view', 'cta_click', 'whatsapp_click', 'dismiss'));

create index if not exists promo_events_item_idx on public.promo_events (item_kind, item_id);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['offers', 'packages']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security ----------
do $$
declare t text;
begin
  foreach t in array array['offers', 'packages']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('create policy "admin full access" on public.%I for all to authenticated using (true) with check (true)', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon using (status = ''published'')', t);
  end loop;
end $$;

alter table public.package_features enable row level security;
drop policy if exists "admin full access" on public.package_features;
create policy "admin full access" on public.package_features for all to authenticated using (true) with check (true);
drop policy if exists "public read" on public.package_features;
create policy "public read" on public.package_features for select to anon using (true);

alter table public.promo_events enable row level security;
drop policy if exists "admin read" on public.promo_events;
create policy "admin read" on public.promo_events for select to authenticated using (true);
drop policy if exists "public insert" on public.promo_events;
create policy "public insert" on public.promo_events for insert to anon with check (true);

-- ---------- settings: popup manager (replaces the v1 promo_kind/promo_item_id design —
-- popup selection now comes from whichever offer/package has show_as_popup = true) ----------
alter table public.settings drop constraint if exists settings_promo_kind_check;
alter table public.settings drop column if exists promo_kind;
alter table public.settings drop column if exists promo_item_id;

alter table public.settings add column if not exists promo_enabled boolean not null default false;
alter table public.settings add column if not exists popup_type text not null default 'offer';
alter table public.settings add column if not exists popup_frequency text not null default 'once_per_visitor';
alter table public.settings add column if not exists popup_delay_seconds integer not null default 3;
alter table public.settings add column if not exists popup_priority text not null default 'normal';
alter table public.settings add column if not exists popup_hide_after_cta boolean not null default true;
alter table public.settings add column if not exists popup_custom_title text not null default '';
alter table public.settings add column if not exists popup_custom_title_ar text not null default '';
alter table public.settings add column if not exists popup_custom_description text not null default '';
alter table public.settings add column if not exists popup_custom_description_ar text not null default '';
alter table public.settings add column if not exists popup_custom_image_url text not null default '';
alter table public.settings add column if not exists popup_custom_link_url text not null default '';
alter table public.settings add column if not exists popup_custom_cta_text text not null default '';
alter table public.settings add column if not exists popup_custom_cta_text_ar text not null default '';

alter table public.settings drop constraint if exists settings_popup_type_check;
alter table public.settings add constraint settings_popup_type_check
  check (popup_type in ('offer', 'package', 'custom', 'image_only', 'announcement'));
alter table public.settings drop constraint if exists settings_popup_frequency_check;
alter table public.settings add constraint settings_popup_frequency_check
  check (popup_frequency in ('once_per_visitor', 'every_visit', 'until_dismissed'));
alter table public.settings drop constraint if exists settings_popup_priority_check;
alter table public.settings add constraint settings_popup_priority_check
  check (popup_priority in ('high', 'normal', 'low'));

-- ---------- exclusivity: only one offer/package can be the popup at a time ----------
create or replace function public.set_promo_popup(p_kind text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('offers', 'packages') then
    raise exception 'invalid kind: %', p_kind;
  end if;

  update public.offers set show_as_popup = false where show_as_popup = true;
  update public.packages set show_as_popup = false where show_as_popup = true;

  if p_kind = 'offers' then
    update public.offers set show_as_popup = true where id = p_id;
  else
    update public.packages set show_as_popup = true where id = p_id;
  end if;
end;
$$;

grant execute on function public.set_promo_popup(text, uuid) to authenticated;
