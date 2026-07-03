"use client";

import { useRef, type MouseEvent, type Ref } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { cn } from "@/lib/cn";
import type { PortfolioItem } from "@/data/portfolio";

export const portfolioSizeClasses: Record<PortfolioItem["size"], string> = {
  sm: "",
  wide: "sm:col-span-2",
  lg: "sm:col-span-2 lg:row-span-2",
};

export function PortfolioCard({
  item,
  title,
  categoryLabel,
  seed,
  onOpen,
}: {
  item: PortfolioItem;
  title: string;
  categoryLabel: string;
  seed: number;
  onOpen: () => void;
}) {
  const t = useTranslations("portfolio");
  const isExternal = Boolean(item.href);
  const isLogo = item.image?.endsWith(".svg");

  const cardRef = useRef<HTMLElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const glowX = useTransform(rotateY, [-6, 6], ["20%", "80%"]);
  const glowY = useTransform(rotateX, [6, -6], ["20%", "80%"]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const rect = el.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * 12);
    rotateX.set(relY * -12);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const media = (
    <>
      <div className="absolute inset-0 transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.07]">
        {item.image && isLogo ? (
          <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-10">
            <MonoLogo src={item.image} label={title} className="h-full w-full" />
          </div>
        ) : item.image ? (
          <Image
            src={item.image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderArt seed={seed} />
        )}
      </div>
      <motion.span
        aria-hidden
        style={{ left: glowX, top: glowY }}
        className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-canvas/92 via-canvas/15 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95" />
      <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-6 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {categoryLabel}
          </p>
          <p className="mt-1 font-display text-lg text-ivory">{title}</p>
        </div>
        <span className="glass inline-flex h-10 flex-none items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.1em] text-ivory">
          {isExternal ? (
            <>
              {t("viewProject")}
              <ExternalLink size={14} aria-hidden />
            </>
          ) : (
            <>
              {t("viewProject")}
              <ArrowUpRight size={14} aria-hidden />
            </>
          )}
        </span>
      </div>
    </>
  );

  const className = cn(
    "group relative isolate flex aspect-[4/5] h-full w-full overflow-hidden rounded-[1.5rem] border border-white/8 bg-canvas-raised transition-[border-color] duration-500 [transform-style:preserve-3d] hover:border-gold/20",
  );

  const motionProps = {
    style: { rotateX, rotateY },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  if (isExternal) {
    return (
      <motion.a
        ref={cardRef as Ref<HTMLAnchorElement>}
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        aria-label={title}
        data-cursor="view"
        {...motionProps}
      >
        {media}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={cardRef as Ref<HTMLButtonElement>}
      type="button"
      onClick={onOpen}
      className={className}
      aria-label={title}
      data-cursor="view"
      {...motionProps}
    >
      {media}
    </motion.button>
  );
}
