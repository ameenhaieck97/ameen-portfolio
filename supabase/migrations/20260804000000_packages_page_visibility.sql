-- ============================================================
-- Public "Packages" page: a visibility switch so the page can be shared
-- privately with selected clients (direct URL still works, hidden from nav/
-- internal links/search engines) before ever going fully public.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

alter table public.settings
  add column if not exists packages_page_visibility text not null default 'hidden';

alter table public.settings drop constraint if exists settings_packages_page_visibility_check;
alter table public.settings add constraint settings_packages_page_visibility_check
  check (packages_page_visibility in ('public', 'hidden'));
