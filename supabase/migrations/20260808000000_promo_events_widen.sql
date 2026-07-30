-- Widen promo_events to also record "view" events for Portfolio projects and
-- Current Work cards, so Studio Analytics can surface top-viewed items there
-- too, not just offers/packages. item_id becomes text because Current Work
-- items use fixed string keys ("institute", "mujeebCenter", …) rather than
-- uuids.
alter table public.promo_events alter column item_id type text using item_id::text;

alter table public.promo_events drop constraint if exists promo_events_item_kind_check;
alter table public.promo_events add constraint promo_events_item_kind_check
  check (item_kind in ('offers', 'packages', 'portfolio', 'current_work'));
