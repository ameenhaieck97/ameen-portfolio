-- ============================================================
-- Public "Offers" page — same visibility model as the Packages page
-- (20260804000000_packages_page_visibility.sql): "hidden" keeps it out of
-- nav/internal links/sitemap and noindexes it, but the direct URL still
-- works, so it can be shared privately before ever going fully public.
-- Independent from packages_page_visibility — each page has its own switch.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

alter table public.settings
  add column if not exists offers_page_visibility text not null default 'hidden';

alter table public.settings drop constraint if exists settings_offers_page_visibility_check;
alter table public.settings add constraint settings_offers_page_visibility_check
  check (offers_page_visibility in ('public', 'hidden'));
