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

/**
 * Every offer worth showing on the public Offers page, in Studio's sort
 * order: active ones always, plus expired ones whose expiration_action is
 * "keep_visible". Scheduled offers stay hidden until their start date
 * actually arrives. Returns an empty array (not an error state) on any
 * failure so the page degrades to "nothing to show yet".
 */
export async function getPublishedOffers(): Promise<Offer[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase
        .from("offers")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      1500,
    );

    if (error || !data) return [];
    return (data as Offer[]).filter((offer) => {
      const effective = getEffectiveOfferStatus(offer);
      if (effective === "active") return true;
      if (effective === "expired") return offer.expiration_action === "keep_visible";
      return false;
    });
  } catch (error) {
    console.error("getPublishedOffers: unexpected error, using empty list:", error);
    return [];
  }
}
