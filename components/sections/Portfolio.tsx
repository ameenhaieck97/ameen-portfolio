"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  portfolioItems,
  type PortfolioGroup,
  type PortfolioItem,
} from "@/data/portfolio";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioLightbox, type PortfolioSlide } from "@/components/portfolio/Lightbox";
import { cn } from "@/lib/cn";
import { textScaleStyle } from "@/lib/text-scale-style";
import { trackPromoEvent } from "@/lib/promo-track";

const GROUPS: PortfolioGroup[] = ["brandIdentity", "graphicDesign", "other"];
const VISIBLE_COUNT = 3;

function CategoryBlock({
  group,
  allItems,
  onOpen,
}: {
  group: PortfolioGroup;
  allItems: PortfolioItem[];
  onOpen: (id: string) => void;
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "en" | "ar";
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(
    () => allItems.filter((item) => item.group === group),
    [allItems, group],
  );
  const visible = items.slice(0, VISIBLE_COUNT);
  const rest = items.slice(VISIBLE_COUNT);

  if (items.length === 0) return null;

  const renderCard = (item: (typeof items)[number], i: number) => (
    <PortfolioCard
      key={item.id}
      item={item}
      title={item.title[locale]}
      categoryLabel={t(`categories.${item.category}`)}
      seed={i + 1}
      onOpen={() => onOpen(item.id)}
    />
  );

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl text-ivory sm:text-3xl">
          {t(`groups.${group}`)}
        </h3>
        <span className="text-xs uppercase tracking-[0.2em] text-ivory/40">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <RevealGroup
        stagger={0.1}
        className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((item, i) => (
          <RevealItem key={item.id} variant="clipReveal">
            {renderCard(item, i)}
          </RevealItem>
        ))}
      </RevealGroup>

      {rest.length > 0 ? (
        <>
          <motion.div
            initial={false}
            animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item, i) => renderCard(item, VISIBLE_COUNT + i))}
            </div>
          </motion.div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="group mt-7 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-gold transition-colors hover:text-gold-soft"
          >
            {expanded ? t("showLess") : t("viewAll")}
            <ChevronDown
              size={15}
              className={cn(
                "transition-transform duration-500",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </>
      ) : null}
    </div>
  );
}

export default function Portfolio({
  items = portfolioItems,
  textScale,
}: {
  /** Supplied by the server from the CMS; falls back to bundled static data. */
  items?: PortfolioItem[];
  textScale?: number;
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "en" | "ar";
  const [openId, setOpenId] = useState<string | null>(null);

  // Slides are scoped to the single open project's own gallery — never a
  // cross-project list — so the lightbox's prev/next arrows cycle through
  // that project's own images only, instead of jumping into other projects.
  const openProject = useMemo(
    () => (openId ? (items.find((item) => item.id === openId) ?? null) : null),
    [items, openId],
  );

  const slides: PortfolioSlide[] = useMemo(() => {
    if (!openProject) return [];
    const gallery =
      openProject.images && openProject.images.length > 0
        ? openProject.images
        : openProject.image
          ? [openProject.image]
          : [];
    return gallery.map((src, i) => ({
      src,
      alt: openProject.title[locale],
      title: openProject.title[locale],
      category: t(`categories.${openProject.category}`),
      seed: i + 1,
      preserveColor: openProject.preserveColor,
      isLogo: openProject.isLogo,
    }));
  }, [openProject, locale, t]);

  const openIndex = openProject ? 0 : -1;

  const handleOpen = (id: string) => {
    setOpenId(id);
    trackPromoEvent("portfolio", id, "view");
  };

  return (
    <section
      id="portfolio"
      className="text-scale-section relative py-20 sm:py-32 lg:py-36"
      style={textScaleStyle(textScale)}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("title")}
          subheading={t("description")}
          index={3}
        />

        <div className="mt-16 space-y-16">
          {GROUPS.map((group) => (
            <CategoryBlock
              key={group}
              group={group}
              allItems={items}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

      <PortfolioLightbox
        slides={slides}
        index={openIndex}
        onClose={() => setOpenId(null)}
      />
    </section>
  );
}
