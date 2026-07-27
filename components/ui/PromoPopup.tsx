"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import type { PromoItem } from "@/lib/promo-data";

const SESSION_KEY = "promo-popup-dismissed";

export function PromoPopup({ promo }: { promo: PromoItem }) {
  const t = useTranslations("promo");
  const locale = useLocale() as "en" | "ar";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  const title = locale === "ar" ? promo.title_ar : promo.title;
  const description = locale === "ar" ? promo.description_ar : promo.description;
  const price = locale === "ar" ? promo.price_ar : promo.price;
  const categoryLabel = promo.kind === "offers" ? t("offerLabel") : t("packageLabel");

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
            className="glass relative w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-white/8"
          >
            <button
              type="button"
              aria-label={t("close")}
              onClick={dismiss}
              className="glass absolute end-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ivory transition-colors hover:text-gold"
            >
              <X size={16} aria-hidden />
            </button>

            <div className="relative aspect-[4/3] w-full">
              {promo.image_url ? (
                <Image
                  src={promo.image_url}
                  alt={title}
                  fill
                  sizes="(min-width: 640px) 384px, 100vw"
                  className="object-cover"
                />
              ) : (
                <PlaceholderArt seed={promo.title.length} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
            </div>

            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{categoryLabel}</p>
              <p className="mt-1.5 font-display text-2xl leading-snug text-ivory">{title}</p>
              {description ? (
                <p className="mt-2 line-clamp-3 text-sm text-ivory/65">{description}</p>
              ) : null}
              <div className="mt-5 flex items-center justify-between gap-4">
                {price ? (
                  <span className="font-display text-lg text-ivory">{price}</span>
                ) : (
                  <span />
                )}
                {promo.link_url ? (
                  <a
                    href={promo.link_url}
                    target={promo.link_url.startsWith("http") ? "_blank" : undefined}
                    rel={promo.link_url.startsWith("http") ? "noreferrer noopener" : undefined}
                    onClick={dismiss}
                    className="glass inline-flex h-10 flex-none items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.1em] text-ivory transition-colors hover:text-gold"
                  >
                    {t("cta")}
                    <ArrowUpRight size={14} aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
