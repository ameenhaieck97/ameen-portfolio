"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { portfolioItems, type PortfolioGroup } from "@/data/portfolio";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioLightbox, type PortfolioSlide } from "@/components/portfolio/Lightbox";
import { cn } from "@/lib/cn";

const GROUPS: PortfolioGroup[] = ["brandIdentity", "graphicDesign", "other"];
const VISIBLE_COUNT = 3;

function CategoryBlock({
  group,
  onOpen,
}: {
  group: PortfolioGroup;
  onOpen: (id: string) => void;
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "en" | "ar";
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(
    () => portfolioItems.filter((item) => item.group === group),
    [group],
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

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "en" | "ar";
  const [openId, setOpenId] = useState<string | null>(null);

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
    preserveColor: item.preserveColor,
  }));

  const openIndex = openId ? imageItems.findIndex((item) => item.id === openId) : -1;

  return (
    <section id="portfolio" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={3}
        />

        <div className="mt-16 space-y-16">
          {GROUPS.map((group) => (
            <CategoryBlock key={group} group={group} onOpen={setOpenId} />
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
