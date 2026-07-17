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

export function PortfolioCard({
  item,
  title,
  categoryLabel,
  seed,
  onOpen,
  featured = false,
  aspectClassName,
}: {
  item: PortfolioItem;
  title: string;
  categoryLabel: string;
  seed: number;
  onOpen: () => void;
  /** Featured cards render larger with more prominent type, for portfolio hierarchy */
  featured?: boolean;
  /** Overrides the default featured/secondary aspect ratio, for a one-off hero treatment */
  aspectClassName?: string;
}) {
  const t = useTranslations("portfolio");
  const isExternal = Boolean(item.href);
  const isLogo = item.image?.endsWith(".svg");

  // A soft, gentle tilt that follows the cursor near the card's edges — a
  // low-stiffness, well-damped spring so it settles smoothly instead of
  // snapping toward the target on the first mousemove.
  const cardRef = useRef<HTMLElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 20, mass: 0.6 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 20, mass: 0.6 });
  const glowX = useTransform(rotateY, [-14, 14], ["25%", "75%"]);
  const glowY = useTransform(rotateX, [14, -14], ["25%", "75%"]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const rect = el.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * 14);
    rotateX.set(relY * -14);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const media = (
    <>
      <div className="absolute inset-0 transition-transform duration-[1400ms] ease-luxury will-change-transform group-hover:scale-[1.03]">
        {item.image && isLogo && item.preserveColor ? (
          <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-10">
            <Image
              src={item.image}
              alt={title}
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />
          </div>
        ) : item.image && isLogo ? (
          <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-8">
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
        className="pointer-events-none absolute h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30 opacity-0 blur-3xl transition-opacity duration-700 ease-luxury group-hover:opacity-100"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/55 to-transparent transition-opacity duration-700 ease-luxury group-hover:opacity-95",
          featured ? "opacity-80" : "opacity-75",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex translate-y-2 flex-col items-start gap-3 opacity-90 transition-all duration-700 ease-luxury group-hover:translate-y-0 group-hover:opacity-100",
          featured ? "p-7 sm:p-8" : "p-6",
        )}
      >
        <div>
          <p
            className={cn(
              "uppercase tracking-[0.2em] text-gold",
              featured ? "text-xs sm:text-sm" : "text-xs",
            )}
          >
            {categoryLabel}
          </p>
          <p
            className={cn(
              "mt-1 font-display leading-snug text-ivory",
              featured ? "text-xl sm:text-2xl" : "text-lg",
            )}
          >
            {title}
          </p>
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
    "group relative isolate flex h-full w-full overflow-hidden rounded-[1.5rem] border border-white/8 bg-canvas-raised transition-[border-color,box-shadow] duration-700 ease-luxury [transform-style:preserve-3d] hover:border-gold/20 hover:shadow-[0_24px_48px_rgba(0,0,0,0.28)]",
    aspectClassName ?? (featured ? "aspect-[4/3]" : "aspect-[4/5]"),
  );

  const motionProps = {
    style: { rotateX, rotateY },
    whileHover: { y: -6 },
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  // The rotateX/rotateY tilt only reads as a real 3D tilt when its containing
  // block establishes a perspective — without this, degrees of rotation
  // render as near-invisible flat shearing instead of a foreshortened tilt.
  if (isExternal) {
    return (
      <div className="h-full w-full [perspective:1200px]">
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
      </div>
    );
  }

  return (
    <div className="h-full w-full [perspective:1200px]">
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
    </div>
  );
}
