"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { portfolioItems } from "@/data/portfolio";
import { PortfolioCard, portfolioSizeClasses } from "@/components/portfolio/PortfolioCard";
import { PortfolioLightbox, type PortfolioSlide } from "@/components/portfolio/Lightbox";

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "en" | "ar";
  const [openIndex, setOpenIndex] = useState(-1);

  const imageItems = useMemo(
    () => portfolioItems.filter((item) => !item.href),
    [],
  );

  const slides: PortfolioSlide[] = imageItems.map((item, i) => ({
    src: item.image ?? "",
    alt: item.title[locale],
    title: item.title[locale],
    category: t(`categories.${item.category}`),
    seed: i + 1,
  }));

  return (
    <section id="portfolio" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={4}
        />

        <RevealGroup
          stagger={0.07}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-3"
        >
          {portfolioItems.map((item, i) => {
            const lightboxIndex = imageItems.indexOf(item);
            return (
              <RevealItem
                key={item.id}
                variant="clipReveal"
                className={portfolioSizeClasses[item.size]}
              >
                <PortfolioCard
                  item={item}
                  title={item.title[locale]}
                  categoryLabel={t(`categories.${item.category}`)}
                  seed={i + 1}
                  onOpen={() => setOpenIndex(lightboxIndex)}
                />
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>

      <PortfolioLightbox
        slides={slides}
        index={openIndex}
        onClose={() => setOpenIndex(-1)}
      />
    </section>
  );
}
