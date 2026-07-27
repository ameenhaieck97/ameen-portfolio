-- ============================================================
-- Phase: per-client logo scale + Offers/Packages + promo popup.
-- 1. clients.logo_scale — lets Studio compensate for a partner logo
--    file that renders visually smaller than its siblings (e.g. a
--    logo with a lot of internal padding baked into its own file),
--    without needing the source file re-exported.
-- 2. offers / packages — same shape, managed via the existing generic
--    EntityManager admin UI, mirroring how skills/services/clients
--    are already managed.
-- 3. settings.promo_* — controls the single "featured" offer or
--    package shown as a popup announcement on the public site.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- clients.logo_scale ----------
alter table public.clients
  add column if not exists logo_scale numeric(3, 2) not null default 1.0;

-- ---------- offers ----------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text not null default '',
  description text not null default '',
  description_ar text not null default '',
  price text not null default '',
  price_ar text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- packages ----------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_ar text not null default '',
  description text not null default '',
  description_ar text not null default '',
  price text not null default '',
  price_ar text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
    execute format('create policy "public read" on public.%I for select to anon using (published = true)', t);
  end loop;
end $$;

-- ---------- settings: promo popup ----------
alter table public.settings
  add column if not exists promo_enabled boolean not null default false;
alter table public.settings
  add column if not exists promo_kind text not null default 'offers';
alter table public.settings
  add column if not exists promo_item_id uuid;

alter table public.settings drop constraint if exists settings_promo_kind_check;
alter table public.settings
  add constraint settings_promo_kind_check check (promo_kind in ('offers', 'packages'));
