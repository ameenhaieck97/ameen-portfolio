import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Renders any logo (vector or raster) as a solid-color silhouette using a
 * CSS mask keyed off the source image's alpha channel. This guarantees a
 * uniform monochrome result regardless of the logo's original colors or
 * file format — no per-file recoloring needed.
 */
export function MonoLogo({
  src,
  label,
  className,
  color = "var(--color-gold)",
  decorative = false,
}: {
  src: string;
  label: string;
  className?: string;
  color?: string;
  decorative?: boolean;
}) {
  const maskStyle: CSSProperties = {
    backgroundColor: color,
    maskImage: `url(${src})`,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "contain",
    WebkitMaskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    WebkitMaskSize: "contain",
  };

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      className={cn("block", className)}
      style={maskStyle}
    />
  );
}
