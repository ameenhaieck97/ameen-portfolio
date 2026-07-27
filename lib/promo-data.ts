import "server-only";
import type { PopupFrequency, PopupPriority, Settings } from "@/types/admin";
import type { ResolvedPopup } from "@/types/promo";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";
import { withTimeout } from "./supabase/with-timeout";
import { getPopupOffer } from "./offers-data";
import { getPopupPackage } from "./packages-data";

export type PromoPopupPayload = {
  popup: ResolvedPopup;
  frequency: PopupFrequency;
  delaySeconds: number;
  priority: PopupPriority;
  hideAfterCta: boolean;
};

type PopupSettingsRow = Pick<
  Settings,
  | "promo_enabled"
  | "popup_type"
  | "popup_frequency"
  | "popup_delay_seconds"
  | "popup_priority"
  | "popup_hide_after_cta"
  | "popup_custom_title"
  | "popup_custom_title_ar"
  | "popup_custom_description"
  | "popup_custom_description_ar"
  | "popup_custom_image_url"
  | "popup_custom_link_url"
  | "popup_custom_cta_text"
  | "popup_custom_cta_text_ar"
>;

/**
 * The homepage popup, resolved from Studio → Popup Manager. Content comes
 * from whichever offer/package has show_as_popup = true (for popup_type
 * "offer"/"package"), or from the custom_* fields directly (for "custom" /
 * "image_only" / "announcement", which have no backing table row). Returns
 * null on anything short of a fully valid, enabled popup so the public site
 * never renders a broken or empty announcement.
 */
export async function getPromoPopup(): Promise<PromoPopupPayload | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase
        .from("settings")
        .select(
          "promo_enabled, popup_type, popup_frequency, popup_delay_seconds, popup_priority, popup_hide_after_cta, popup_custom_title, popup_custom_title_ar, popup_custom_description, popup_custom_description_ar, popup_custom_image_url, popup_custom_link_url, popup_custom_cta_text, popup_custom_cta_text_ar",
        )
        .eq("id", 1)
        .maybeSingle(),
      1500,
    );

    if (error || !data) return null;
    const settings = data as PopupSettingsRow;
    if (!settings.promo_enabled) return null;

    const popup = await resolvePopupContent(settings);
    if (!popup) return null;

    return {
      popup,
      frequency: settings.popup_frequency,
      delaySeconds: settings.popup_delay_seconds,
      priority: settings.popup_priority,
      hideAfterCta: settings.popup_hide_after_cta,
    };
  } catch (error) {
    console.error("getPromoPopup: unexpected error, hiding popup:", error);
    return null;
  }
}

async function resolvePopupContent(settings: PopupSettingsRow): Promise<ResolvedPopup | null> {
  if (settings.popup_type === "offer") {
    const offer = await getPopupOffer();
    if (!offer) return null;
    return {
      source: "offer",
      itemKind: "offers",
      itemId: offer.id,
      title: offer.name,
      title_ar: offer.name_ar || offer.name,
      description: offer.description,
      description_ar: offer.description_ar,
      imageUrl: offer.image_url,
      accentColor: offer.accent_color,
      ctaText: offer.cta_text,
      ctaText_ar: offer.cta_text_ar || offer.cta_text,
      ctaLink: offer.cta_link,
      endDate: offer.end_date,
    };
  }

  if (settings.popup_type === "package") {
    const pkg = await getPopupPackage();
    if (!pkg) return null;
    return {
      source: "package",
      itemKind: "packages",
      itemId: pkg.id,
      title: pkg.name,
      title_ar: pkg.name_ar || pkg.name,
      description: pkg.short_description,
      description_ar: pkg.short_description_ar,
      imageUrl: pkg.image_url,
      accentColor: pkg.accent_color,
      ctaText: "",
      ctaText_ar: "",
      ctaLink: "",
      endDate: null,
    };
  }

  // custom / image_only / announcement — no backing table row, so any
  // required content missing means there's nothing valid to show.
  if (!settings.popup_custom_title && !settings.popup_custom_image_url) return null;

  return {
    source: settings.popup_type,
    itemKind: null,
    itemId: null,
    title: settings.popup_custom_title,
    title_ar: settings.popup_custom_title_ar || settings.popup_custom_title,
    description: settings.popup_custom_description,
    description_ar: settings.popup_custom_description_ar,
    imageUrl: settings.popup_custom_image_url,
    accentColor: "#EEDF7A",
    ctaText: settings.popup_custom_cta_text,
    ctaText_ar: settings.popup_custom_cta_text_ar || settings.popup_custom_cta_text,
    ctaLink: settings.popup_custom_link_url,
    endDate: null,
  };
}
