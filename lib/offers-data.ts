import "server-only";
import type { Offer } from "@/types/promo";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";
import { withTimeout } from "./supabase/with-timeout";
import { getEffectiveOfferStatus } from "./promo-status";

/**
 * The single offer currently flagged "show as popup", if it's published and
 * not outside its start/end window. Returns null on anything short of that
 * (disabled, none flagged, scheduled, expired) so the popup never renders a
 * broken or premature offer.
 */
export async function getPopupOffer(): Promise<Offer | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase
        .from("offers")
        .select("*")
        .eq("show_as_popup", true)
        .eq("status", "published")
        .maybeSingle(),
      1500,
    );

    if (error || !data) return null;
    const offer = data as Offer;
    return getEffectiveOfferStatus(offer) === "active" ? offer : null;
  } catch (error) {
    console.error("getPopupOffer: unexpected error, hiding popup:", error);
    return null;
  }
}
