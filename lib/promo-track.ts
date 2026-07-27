"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { PromoEventType } from "@/types/promo";

/**
 * Fire-and-forget analytics event for a promo item. Anon writes are allowed
 * by RLS (insert-only, no select) precisely so this can run unauthenticated
 * from the public site — a failure here must never block or throw in the
 * caller's UI flow, so errors are swallowed after a console warning.
 */
export function trackPromoEvent(
  itemKind: "offers" | "packages",
  itemId: string,
  eventType: PromoEventType,
) {
  void getSupabaseClient()
    .from("promo_events")
    .insert({ item_kind: itemKind, item_id: itemId, event_type: eventType })
    .then(({ error }) => {
      if (error) console.warn("trackPromoEvent: failed to record event:", error.message);
    });
}
