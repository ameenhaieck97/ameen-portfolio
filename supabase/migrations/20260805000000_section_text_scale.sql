-- ============================================================
-- Per-section text size control: lets Studio scale the font size of an
-- entire homepage section (Hero, About, Services, etc.) up or down without
-- touching individual text elements. Stored as a single JSON map so adding
-- a new controllable section later needs no further migration.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

alter table public.settings
  add column if not exists section_text_scale jsonb not null default '{}'::jsonb;
