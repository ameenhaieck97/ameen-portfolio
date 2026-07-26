-- ============================================================
-- About section photo: lets the Studio Settings page upload a real
-- photo for the About card, replacing the abstract monogram
-- placeholder. settings already has a "public read" policy for
-- anon (20260718000000_admin_schema.sql), so no new grants needed.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

alter table public.settings
  add column if not exists about_photo_url text not null default '';
