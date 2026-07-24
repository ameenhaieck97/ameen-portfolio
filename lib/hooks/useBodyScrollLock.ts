"use client";

import { useEffect } from "react";

/**
 * Scroll lock that never moves the page. A plain `overflow:hidden` lock
 * collapses the page's scrollable height and snaps scrollY to 0 the instant
 * it's applied — visible here because the Studio (like the public site) uses
 * CSS scroll-behavior: smooth, so restoring afterward animates. Instead this
 * pins <body> with position:fixed at an offset that keeps the exact same
 * pixels on screen, then on unlock puts the offset back with an explicitly
 * instant (non-smooth) scroll. The page behind the overlay never visually
 * moves at any point.
 *
 * A separate copy of the same pattern used in components/portfolio/Lightbox.tsx
 * (public-site code, intentionally left untouched) — kept distinct so admin
 * changes never risk the public site.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
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
  }, [locked]);
}
