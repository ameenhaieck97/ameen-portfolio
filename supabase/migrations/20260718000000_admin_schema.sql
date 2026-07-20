-- ============================================================
-- Ameen Haieck Portfolio — Admin schema
-- Run this whole file once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- shared updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- services ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- skills ----------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- experience ----------
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null default '',
  start_year text not null default '',
  end_year text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  role text not null default '',
  quote text not null,
  avatar_url text not null default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  full_description text not null default '',
  client text not null default '',
  year integer,
  category_id uuid references public.categories (id) on delete set null,
  technologies text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  cover_image text not null default '',
  gallery_images text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_category_idx on public.projects (category_id);
create index if not exists projects_published_idx on public.projects (published);

-- ---------- project ↔ services join ----------
create table if not exists public.project_services (
  project_id uuid not null references public.projects (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (project_id, service_id)
);

-- ---------- settings (singleton row) ----------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  site_title text not null default '',
  site_description text not null default '',
  contact_email text not null default '',
  phone text not null default '',
  location text not null default '',
  social_links jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['categories','services','skills','experience','testimonials','projects','settings']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- row level security ----------
-- Authenticated (the admin) gets full access; anonymous visitors get
-- read-only access so the public site can consume this data later.
do $$
declare t text;
begin
  foreach t in array array['categories','services','skills','experience','testimonials','projects','project_services','settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('create policy "admin full access" on public.%I for all to authenticated using (true) with check (true)', t);
    execute format('drop policy if exists "public read" on public.%I', t);
  end loop;
end $$;

create policy "public read" on public.categories for select to anon using (true);
create policy "public read" on public.services for select to anon using (true);
create policy "public read" on public.skills for select to anon using (true);
create policy "public read" on public.experience for select to anon using (true);
create policy "public read" on public.settings for select to anon using (true);
create policy "public read" on public.project_services for select to anon using (true);
create policy "public read" on public.testimonials for select to anon using (published = true);
create policy "public read" on public.projects for select to anon using (published = true);

-- ---------- storage bucket ----------
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read" on storage.objects
  for select to public using (bucket_id = 'portfolio');

drop policy if exists "portfolio admin insert" on storage.objects;
create policy "portfolio admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio');

drop policy if exists "portfolio admin update" on storage.objects;
create policy "portfolio admin update" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio');

drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio');
