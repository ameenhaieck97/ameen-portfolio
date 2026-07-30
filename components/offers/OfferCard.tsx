"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PromoCard } from "@/components/ui/PromoCard";
import { trackPromoEvent } from "@/lib/promo-track";
import type { Offer } from "@/types/promo";

function isWhatsappLink(href: string) {
  return href.includes("wa.me") || href.includes("whatsapp.com");
}

/** Thin client wrapper around the shared PromoCard — adds locale-aware
 * copy and analytics (a "view" the moment it renders, "cta_click" /
 * "whatsapp_click" on click), the same events the popup already tracks. */
export function OfferCard({ offer }: { offer: Offer }) {
  const locale = useLocale() as "en" | "ar";
  const tOffers = useTranslations("offersPage");
  const tPromo = useTranslations("promo");

  useEffect(() => {
    trackPromoEvent("offers", offer.id, "view");
  }, [offer.id]);

  const title = locale === "ar" ? offer.name_ar || offer.name : offer.name;
  const description = locale === "ar" ? offer.description_ar : offer.description;
  const ctaText = (locale === "ar" ? offer.cta_text_ar : offer.cta_text) || tOffers("learnMore");

  const handleCtaClick = () => {
    trackPromoEvent("offers", offer.id, "cta_click");
    if (offer.cta_link && isWhatsappLink(offer.cta_link)) {
      trackPromoEvent("offers", offer.id, "whatsapp_click");
    }
  };

  return (
    <PromoCard
      kind="offer"
      eyebrow={tPromo("offerLabel")}
      title={title}
      description={description}
      imageUrl={offer.image_url}
      accentColor={offer.accent_color}
      priceLabel={offer.offer_value}
      endDate={offer.end_date}
      ctaText={ctaText}
      ctaHref={offer.cta_link || undefined}
      onCtaClick={handleCtaClick}
      className="h-full"
    />
  );
}
