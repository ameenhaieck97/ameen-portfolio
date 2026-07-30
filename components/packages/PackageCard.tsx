"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronDown, Clock, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/GlassCard";
import { buildPackageWhatsappLink } from "@/lib/whatsapp-message";
import { trackPromoEvent } from "@/lib/promo-track";
import { cn } from "@/lib/cn";
import type { Package } from "@/types/promo";

export function PackageCard({ pkg }: { pkg: Package }) {
  const t = useTranslations("packagesPage");
  const locale = useLocale() as "en" | "ar";
  const [expanded, setExpanded] = useState(false);

  const name = locale === "ar" ? pkg.name_ar || pkg.name : pkg.name;
  const shortDescription = locale === "ar" ? pkg.short_description_ar : pkg.short_description;
  const fullDescription = locale === "ar" ? pkg.full_description_ar : pkg.full_description;
  const hasFullDescription = fullDescription.trim().length > 0;

  const priceLabel =
    pkg.currency === "USD" ? `$${pkg.price}` : `${pkg.price} ${t("currencyIqd")}`;
  const billingLabel = pkg.billing_period === "monthly" ? t("perMonth") : t("oneTime");

  const ctaHref = buildPackageWhatsappLink(name, locale);

  const handleCtaClick = () => {
    trackPromoEvent("packages", pkg.id, "cta_click");
    trackPromoEvent("packages", pkg.id, "whatsapp_click");
  };

  return (
    <GlassCard
      variant="glass"
      className={cn(
        "flex h-full flex-col p-6 transition-all duration-700 ease-luxury hover:-translate-y-1.5 sm:p-7",
        pkg.is_primary && "border-gold/30 shadow-[0_0_0_1px_rgba(238,223,122,0.25)]",
      )}
    >
      {pkg.is_primary || pkg.badge ? (
        <span
          style={{ backgroundColor: pkg.accent_color }}
          className="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-canvas"
        >
          {pkg.badge || t("mostPopular")}
        </span>
      ) : null}

      {pkg.image_url ? (
        <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image
            src={pkg.image_url}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <p className="font-display text-2xl text-ivory">{name}</p>
      {shortDescription ? (
        <p className="text-pretty mt-2 text-sm leading-relaxed text-ivory/65">{shortDescription}</p>
      ) : null}

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-3xl text-ivory">{priceLabel}</span>
        <span className="text-sm text-ivory/50">{billingLabel}</span>
      </div>

      {pkg.features.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {pkg.features.map((feature) => {
            const label = locale === "ar" ? feature.label_ar || feature.label : feature.label;
            return (
              <li key={feature.id} className="flex items-start gap-2.5 text-sm text-ivory/75">
                <Check
                  size={15}
                  style={{ color: pkg.accent_color }}
                  className="mt-0.5 flex-none"
                  aria-hidden
                />
                {label}
              </li>
            );
          })}
        </ul>
      ) : null}

      {pkg.execution_time || pkg.revisions ? (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/8 pt-4 text-xs text-ivory/55">
          {pkg.execution_time ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} aria-hidden />
              {pkg.execution_time}
            </span>
          ) : null}
          {pkg.revisions ? (
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={13} aria-hidden />
              {pkg.revisions}
            </span>
          ) : null}
        </div>
      ) : null}

      {hasFullDescription ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
          >
            {expanded ? t("showLess") : t("showMore")}
            <ChevronDown
              size={15}
              className={cn("transition-transform duration-300 ease-luxury", expanded && "rotate-180")}
              aria-hidden
            />
          </button>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="text-pretty mt-3 text-sm leading-relaxed text-ivory/65">{fullDescription}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      <a
        href={ctaHref}
        target="_blank"
        rel="noreferrer noopener"
        onClick={handleCtaClick}
        style={{ backgroundColor: pkg.accent_color }}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-canvas transition-transform hover:scale-[1.02]"
      >
        {t("cta")}
        <ArrowUpRight size={16} aria-hidden />
      </a>
    </GlassCard>
  );
}
