export type OfferType = "percentage" | "fixed" | "free_service" | "limited" | "announcement";
export type PromoStatus = "draft" | "published";
export type ExpirationAction = "hide" | "archive" | "keep_visible";
/** Computed, never stored — derived from status + start_date/end_date at read time. */
export type EffectiveOfferStatus = "draft" | "scheduled" | "active" | "expired";

export type Offer = {
  id: string;
  name: string;
  name_ar: string;
  offer_type: OfferType;
  offer_value: string;
  description: string;
  description_ar: string;
  image_url: string;
  accent_color: string;
  cta_text: string;
  cta_text_ar: string;
  cta_link: string;
  start_date: string | null;
  end_date: string | null;
  status: PromoStatus;
  expiration_action: ExpirationAction;
  show_as_popup: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Currency = "USD" | "IQD";
export type BillingPeriod = "one_time" | "monthly";

export type PackageFeature = {
  id: string;
  package_id: string;
  label: string;
  label_ar: string;
  sort_order: number;
};

export type Package = {
  id: string;
  name: string;
  name_ar: string;
  short_description: string;
  short_description_ar: string;
  full_description: string;
  full_description_ar: string;
  image_url: string;
  accent_color: string;
  price: number;
  currency: Currency;
  billing_period: BillingPeriod;
  execution_time: string;
  revisions: string;
  badge: string;
  is_primary: boolean;
  show_as_popup: boolean;
  status: PromoStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  features: PackageFeature[];
};

export type PromoEventType = "view" | "popup_view" | "cta_click" | "whatsapp_click" | "dismiss";

export type PromoAnalytics = {
  views: number;
  popupViews: number;
  ctaClicks: number;
  whatsappClicks: number;
  dismissCount: number;
  /** CTA clicks / (views + popupViews), 0 when there's no traffic yet. */
  conversionRate: number;
};

/** Resolved popup payload the public site actually renders — already normalized
 * across the offer/package/custom source types so PromoPopup doesn't need to
 * know which one it came from. */
export type ResolvedPopup = {
  source: "offer" | "package" | "custom" | "image_only" | "announcement";
  /** Present only when source is "offer" or "package" — used for analytics + countdown. */
  itemKind: "offers" | "packages" | null;
  itemId: string | null;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  imageUrl: string;
  accentColor: string;
  ctaText: string;
  ctaText_ar: string;
  ctaLink: string;
  /** Offers only — drives the countdown. */
  endDate: string | null;
};
