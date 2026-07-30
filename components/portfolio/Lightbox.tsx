"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
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

const PAN_TRANSITION = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";
// Below this many pixels of pointer travel, a press-release is still
// treated as a tap/click (toggles zoom) rather than a pan gesture.
const DRAG_THRESHOLD = 6;

// Click (desktop) or double-tap (mobile) toggles a 2x zoom on the photo
// itself — kept as a self-contained toggle here rather than the library's
// Zoom plugin, since that plugin takes over rendering any slide it
// recognizes as an image and would silently drop this component's own
// glass card / caption / logo / placeholder layouts. Once zoomed, the image
// can be panned — mouse-drag on desktop, touch-drag on mobile/tablet — via
// the Pointer Events API, which unifies both input types in one handler set.
function LightboxSlide({ slide: s }: { slide: PortfolioSlide }) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const wasDragRef = useRef(false);
  const lastTapRef = useRef(0);
  const isLogo = Boolean(s.isLogo);
  // Logos and the placeholder mark are already shown at their natural,
  // fully-visible size — zooming them in wouldn't reveal any extra detail
  // the way it does for an actual photo.
  const zoomable = Boolean(s.src) && !isLogo;

  const toggleZoom = () => {
    if (!zoomable) return;
    setZoomed((z) => !z);
    setPan({ x: 0, y: 0 });
  };

  const clampPan = (x: number, y: number) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    // At scale(2) the image element is twice the container's size, so it
    // overflows by exactly half the container's own width/height on each
    // side — clamping to that keeps the frame always fully covered.
    const maxX = el.offsetWidth / 2;
    const maxY = el.offsetHeight / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, startPanX: pan.x, startPanY: pan.y };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!isPanning && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      setIsPanning(true);
      wasDragRef.current = true;
    }
    if (wasDragRef.current) {
      setPan(clampPan(drag.startPanX + dx, drag.startPanY + dy));
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsPanning(false);
  };

  const handleTouchEnd = () => {
    if (!zoomable) return;
    // A pan gesture just ending also fires touchend — swallow that one tap
    // instead of letting it register toward the double-tap-to-zoom timer.
    if (wasDragRef.current) {
      wasDragRef.current = false;
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 300) toggleZoom();
    lastTapRef.current = now;
  };

  const handleClick = () => {
    if (wasDragRef.current) {
      wasDragRef.current = false;
      return;
    }
    toggleZoom();
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center p-6">
      <div className="glass flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl">
        {/* aspect-ratio (not flex-1) gives this a definite height derived
            from its own width — a next/image `fill` child is positioned
            absolutely and contributes no intrinsic size of its own, so
            without this the image area collapses to ~0px tall (the bug:
            only the caption below it, which has real content, showed up). */}
        <div
          ref={containerRef}
          className={cn(
            "relative aspect-[4/5] w-full select-none",
            zoomed && "touch-none",
            zoomable && (zoomed ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"),
          )}
          onClick={handleClick}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(event) => event.preventDefault()}
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
              draggable={false}
              className="object-cover"
              style={{
                // translate first, scale second — so the translate values
                // are plain screen pixels (1:1 with pointer movement)
                // regardless of the zoom factor. No transition while
                // actively panning, so the image tracks the pointer/finger
                // exactly instead of trailing behind it.
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 2 : 1})`,
                transition: isPanning ? "none" : PAN_TRANSITION,
              }}
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
