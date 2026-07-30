-- Maintenance Mode: when enabled, the public site (app/[locale]/**) shows a
-- single "back soon" page instead of the normal homepage/packages/offers
-- routes. Studio (/studio) is a separate route tree and is never affected.
alter table settings
  add column if not exists maintenance_mode boolean not null default false;
