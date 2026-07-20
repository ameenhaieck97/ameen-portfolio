"use client";

import { useEffect } from "react";
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
  // Scroll lock that never moves the page. The library's own lock (body
  // overflow:hidden) collapses this layout's scrollable height, snapping
  // scrollY to 0 the instant it opens — and restoring afterwards animates
  // visibly because the site uses CSS scroll-behavior: smooth. So the
  // library lock is disabled below (noScroll) and replaced with the
  // body-freeze pattern: pin <body> with position:fixed at an offset that
  // keeps the exact same pixels on screen, then on close put the offset
  // back with an explicitly instant (non-smooth) scroll. The page behind
  // the lightbox never visually moves at any point.
  const open = index >= 0;

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    // Keep the scrollbar track while the page can't scroll, so content
    // doesn't shift sideways when the document scrollbar disappears.
    html.style.overflowY = "scroll";

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      html.style.overflowY = "";
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, [open]);

  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
      noScroll={{ disabled: true }}
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
