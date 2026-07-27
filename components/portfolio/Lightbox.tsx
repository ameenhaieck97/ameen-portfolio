"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Lightbox, { type SlideImage } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { cn } from "@/lib/cn";

export type PortfolioSlide = SlideImage & {
  title: string;
  category: string;
  seed: number;
  preserveColor?: boolean;
  isLogo?: boolean;
};

// Click (desktop) or double-tap (mobile) toggles a 2x zoom on the photo
// itself — kept as a self-contained toggle here rather than the library's
// Zoom plugin, since that plugin takes over rendering any slide it
// recognizes as an image and would silently drop this component's own
// glass card / caption / logo / placeholder layouts.
function LightboxSlide({ slide: s }: { slide: PortfolioSlide }) {
  const [zoomed, setZoomed] = useState(false);
  const lastTapRef = useRef(0);
  const isLogo = Boolean(s.isLogo);
  // Logos and the placeholder mark are already shown at their natural,
  // fully-visible size — zooming them in wouldn't reveal any extra detail
  // the way it does for an actual photo.
  const zoomable = Boolean(s.src) && !isLogo;

  const toggleZoom = () => zoomable && setZoomed((z) => !z);

  const handleTouchEnd = () => {
    if (!zoomable) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) toggleZoom();
    lastTapRef.current = now;
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6">
      <div className="glass flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl">
        <div
          className={cn(
            "relative min-h-0 flex-1",
            zoomable && (zoomed ? "cursor-zoom-out" : "cursor-zoom-in"),
          )}
          onClick={toggleZoom}
          onTouchEnd={handleTouchEnd}
        >
          {s.src && isLogo && s.preserveColor ? (
            <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-10">
              <Image
                src={s.src}
                alt={s.title}
                width={280}
                height={280}
                className="h-full w-full object-contain"
              />
            </div>
          ) : s.src && isLogo ? (
            <div className="flex h-full w-full items-center justify-center bg-canvas-soft p-6">
              <MonoLogo src={s.src} label={s.title} className="h-full w-full" />
            </div>
          ) : s.src ? (
            <Image
              src={s.src}
              alt={s.title}
              fill
              sizes="(min-width: 640px) 36rem, 100vw"
              className={cn(
                "object-cover transition-transform duration-500 ease-luxury",
                zoomed && "scale-[2]",
              )}
            />
          ) : (
            <PlaceholderArt seed={s.seed} />
          )}
        </div>
        {/* Connected footer, not an overlay on the photo — same card width
            and corner radius, just its own zone below the image. */}
        <div className="flex-none border-t border-white/8 px-6 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{s.category}</p>
          <p className="mt-1 font-display text-2xl text-ivory">{s.title}</p>
        </div>
      </div>
    </div>
  );
}

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
        ...(slides.length <= 1
          ? { buttonPrev: () => null, buttonNext: () => null }
          : {}),
        slide: ({ slide }) => <LightboxSlide slide={slide as PortfolioSlide} />,
      }}
    />
  );
}
