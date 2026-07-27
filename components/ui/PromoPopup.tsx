"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PromoCard } from "@/components/ui/PromoCard";
import { contact } from "@/data/contact";
import { trackPromoEvent } from "@/lib/promo-track";
import type { PromoPopupPayload } from "@/lib/promo-data";

function storageKeyFor(payload: PromoPopupPayload) {
  return `promo:${payload.popup.source}:${payload.popup.itemId ?? "custom"}`;
}

function isWhatsappLink(href: string) {
  return href.includes("wa.me") || href.includes("whatsapp.com");
}

export function PromoPopup({ payload }: { payload: PromoPopupPayload }) {
  const t = useTranslations("promo");
  const locale = useLocale() as "en" | "ar";
  const [open, setOpen] = useState(false);

  const key = storageKeyFor(payload);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(`${key}:shown`);
    const dismissed = localStorage.getItem(`${key}:dismissed`);

    if (payload.frequency === "once_per_visitor" && alreadyShown) return;
    if (payload.frequency === "until_dismissed" && dismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(`${key}:shown`, "1");
      if (payload.popup.itemKind && payload.popup.itemId) {
        trackPromoEvent(payload.popup.itemKind, payload.popup.itemId, "popup_view");
      }
    }, payload.delaySeconds * 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    setOpen(false);
    if (payload.frequency === "until_dismissed") localStorage.setItem(`${key}:dismissed`, "1");
    if (payload.popup.itemKind && payload.popup.itemId) {
      trackPromoEvent(payload.popup.itemKind, payload.popup.itemId, "dismiss");
    }
  };

  const handleCtaClick = () => {
    if (payload.popup.itemKind && payload.popup.itemId) {
      trackPromoEvent(payload.popup.itemKind, payload.popup.itemId, "cta_click");
      if (ctaHref && isWhatsappLink(ctaHref)) {
        trackPromoEvent(payload.popup.itemKind, payload.popup.itemId, "whatsapp_click");
      }
    }
    if (payload.hideAfterCta) localStorage.setItem(`${key}:dismissed`, "1");
    setOpen(false);
  };

  const { popup } = payload;
  const title = locale === "ar" ? popup.title_ar : popup.title;
  const description = locale === "ar" ? popup.description_ar : popup.description;
  const ctaText = locale === "ar" ? popup.ctaText_ar : popup.ctaText;

  let ctaHref = popup.ctaLink;
  if (popup.source === "package" && !ctaHref) {
    const message =
      locale === "ar"
        ? `مرحباً أمين،\nأنا مهتم بباقة ${title}.`
        : `Hello Ameen,\nI'm interested in the ${title} Package.`;
    ctaHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  const eyebrow =
    popup.source === "offer"
      ? t("offerLabel")
      : popup.source === "package"
        ? t("packageLabel")
        : "";

  const resolvedCtaText = ctaText || (popup.source === "package" ? t("cta") : "");

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm"
          >
            <button
              type="button"
              aria-label={t("close")}
              onClick={dismiss}
              className="glass absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ivory transition-colors hover:text-gold"
            >
              <X size={16} aria-hidden />
            </button>

            <PromoCard
              kind={popup.source}
              eyebrow={eyebrow}
              title={title}
              description={description}
              imageUrl={popup.imageUrl}
              accentColor={popup.accentColor}
              endDate={popup.endDate}
              ctaText={resolvedCtaText}
              ctaHref={ctaHref || undefined}
              onCtaClick={handleCtaClick}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
