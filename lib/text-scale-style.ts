import type { CSSProperties } from "react";

/**
 * Inline style carrying a section's --section-text-scale custom property —
 * see the .text-scale-section rule in app/[locale]/globals.css, which
 * recomputes Tailwind's font-size tokens from this value. React's
 * CSSProperties type doesn't know about custom properties, hence the cast.
 */
export function textScaleStyle(scale: number | undefined): CSSProperties {
  return { "--section-text-scale": scale ?? 1 } as CSSProperties;
}
