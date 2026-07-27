import "server-only";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";
import { withTimeout } from "./supabase/with-timeout";

export type PromoItem = {
  kind: "offers" | "packages";
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  price: string;
  price_ar: string;
  image_url: string;
  link_url: string;
};

type SettingsPromoRow = {
  promo_enabled: boolean;
  promo_kind: "offers" | "packages";
  promo_item_id: string | null;
};

type PromoEntityRow = {
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: string | null;
  price_ar: string | null;
  image_url: string | null;
  link_url: string | null;
  published: boolean;
};

/**
 * The homepage's promo popup, set from Studio → Settings. Returns null
 * whenever the popup shouldn't show — disabled, no item chosen, the chosen
 * item was deleted, or it's unpublished — so the site never renders a
 * broken/empty popup.
 */
export async function getPromo(): Promise<PromoItem | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServerReadClient();
    const { data: settings, error: settingsError } = await withTimeout(
      supabase
        .from("settings")
        .select("promo_enabled, promo_kind, promo_item_id")
        .eq("id", 1)
        .maybeSingle(),
      1500,
    );

    if (settingsError || !settings) return null;
    const { promo_enabled, promo_kind, promo_item_id } = settings as SettingsPromoRow;
    if (!promo_enabled || !promo_item_id) return null;

    const { data: item, error: itemError } = await withTimeout(
      supabase
        .from(promo_kind)
        .select("title, title_ar, description, description_ar, price, price_ar, image_url, link_url, published")
        .eq("id", promo_item_id)
        .maybeSingle(),
      1500,
    );

    if (itemError || !item) return null;
    const row = item as PromoEntityRow;
    if (!row.published) return null;

    return {
      kind: promo_kind,
      title: row.title,
      title_ar: row.title_ar || row.title,
      description: row.description ?? "",
      description_ar: row.description_ar ?? "",
      price: row.price ?? "",
      price_ar: row.price_ar ?? "",
      image_url: row.image_url ?? "",
      link_url: row.link_url ?? "",
    };
  } catch (error) {
    console.error("getPromo: unexpected error, hiding popup:", error);
    return null;
  }
}
