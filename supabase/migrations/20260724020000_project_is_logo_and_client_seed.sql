-- ============================================================
-- Ameen Haieck Portfolio — explicit logo-mark flag + seed the
-- new clients table with the existing static partner logos.
-- Run once in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

-- ---------- projects.is_logo ----------
-- Whether a project's cover/gallery images should render centered and
-- masked like a logo mark (see PortfolioCard/Lightbox) instead of filling
-- the card edge-to-edge like a photo or poster. This replaces an earlier
-- file-extension guess (".svg") that broke for any uploaded PNG/JPG logo
-- and, conversely, defaulted every uploaded poster/photo into the cramped
-- centered treatment.
alter table public.projects add column if not exists is_logo boolean not null default false;

-- Backfill: only the original seeded SVG logo marks get is_logo = true —
-- everything else (including anything already uploaded through the studio)
-- defaults to false (fills its card) until you explicitly opt a project
-- into logo treatment via its Advanced settings.
update public.projects set is_logo = true where cover_image ilike '%.svg';

-- ---------- seed clients from the existing static partner logos ----------
insert into public.clients (name, name_ar, logo_url, sort_order) values
  ('Al-Hay''a Al-Ilmiyya', 'الهيئة العلمائية', '/images/partners/al-hayaa-al-ilmiyya.svg', 0),
  ('LTV Channel', 'قناة LTV', '/images/partners/ltv-channel.svg', 1),
  ('Sham TV', 'قناة شام تي في', '/images/partners/sham-tv.svg', 2),
  ('Hawiya Foundation', 'مؤسسة هوية', '/images/partners/hawiya-foundation.svg', 3),
  ('Syrian Ministry of Health', 'وزارة الصحة السورية', '/images/partners/syria-ministry-of-health.svg', 4),
  ('La Luna', 'La Luna', '/images/partners/la-luna.svg', 5),
  ('Lali', 'Lali', '/images/partners/lali.svg', 6),
  ('Ragu', 'Ragu', '/images/partners/ragu.svg', 7),
  ('Rammal', 'رمّال', '/images/partners/rammal.svg', 8),
  ('Fly Sham', 'فلاي شام', '/images/partners/fly-sham.svg', 9),
  ('Sultan Saray', 'Sultan Saray', '/images/partners/ss.svg', 10),
  ('Ushqimi i Nxehtë', 'Ushqimi i Nxehtë', '/images/partners/un.svg', 11)
on conflict do nothing;
