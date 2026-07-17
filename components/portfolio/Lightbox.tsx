"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { MonoLogo } from "@/components/ui/MonoLogo";

export type PortfolioSlide = SlideImage & {
  title: string;
  category: string;
  seed: number;
  preserveColor?: boolean;
};

export function PortfolioLightbox({
  slides,
  index,
  onClose,
}: {
  slides: PortfolioSlide[];
  index: number;
  onClose: () => void;
}) {
  // The lightbox library locks scroll by setting `overflow: hidden` on
  // <body>. Because our <body> is the page's actual scroll container (a
  // flex column sized with min-h-full, not a fixed-height wrapper around a
  // separately-scrolling <html>), hiding its overflow collapses its
  // scrollable height and resets scrollY to 0 the instant the lightbox
  // opens — silently, before any close/exit logic runs. Save the position
  // ourselves on open and restore it once the lock is released on close.
  const savedScrollY = useRef<number | null>(null);
  const open = index >= 0;

  useEffect(() => {
    if (open) {
      savedScrollY.current = window.scrollY;
      return;
    }
    if (savedScrollY.current !== null) {
      const y = savedScrollY.current;
      savedScrollY.current = null;
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [open]);

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      styles={{
        container: {
          "--yarl__color_backdrop": "rgba(41, 39, 38, 0.95)",
          "--yarl__color_button": "#f6f3ec",
          "--yarl__color_button_active": "#eedf7a",
        },
      }}
      render={{
        slide: ({ slide }) => {
          const s = slide as PortfolioSlide;
          const isLogo = s.src?.endsWith(".svg");
          if (s.src && !isLogo) return undefined;
          return (
            <div className="relative flex h-full w-full items-center justify-center p-6">
              <div className="glass relative aspect-[4/5] max-h-full w-full max-w-xl overflow-hidden rounded-2xl">
                {isLogo && s.preserveColor ? (
                  <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-10">
                    <Image
                      src={s.src ?? ""}
                      alt={s.title}
                      width={280}
                      height={280}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : isLogo ? (
                  <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-6">
                    <MonoLogo src={s.src} label={s.title} className="h-full w-full" />
                  </div>
                ) : (
                  <PlaceholderArt seed={s.seed} />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas/95 to-transparent p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">
                    {s.category}
                  </p>
                  <p className="mt-1 font-display text-2xl text-ivory">
                    {s.title}
                  </p>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}
