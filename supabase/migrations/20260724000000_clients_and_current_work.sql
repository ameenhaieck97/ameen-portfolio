-- ============================================================
-- Ameen Haieck Portfolio — Clients (partner logos) + Current Work
-- galleries. Run once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- ---------- clients (public "Clients & Organizations" logo slider) ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null default '',
  logo_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- current_work_galleries (the 4 "Currently" ecosystem cards) ----------
create table if not exists public.current_work_galleries (
  project_key text primary key check (project_key in ('institute', 'mujeebCenter', 'najafPodcast', 'iliaApp')),
  gallery_images text[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.current_work_galleries (project_key) values
  ('institute'), ('mujeebCenter'), ('najafPodcast'), ('iliaApp')
on conflict (project_key) do nothing;

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['clients', 'current_work_galleries']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security ----------
do $$
declare t text;
begin
  foreach t in array array['clients', 'current_work_galleries']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('create policy "admin full access" on public.%I for all to authenticated using (true) with check (true)', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon using (true)', t);
  end loop;
end $$;
