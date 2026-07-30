import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { Countdown } from "@/components/ui/Countdown";
import { cn } from "@/lib/cn";

export type PromoCardProps = {
  kind: "offer" | "package" | "custom" | "image_only" | "announcement";
  eyebrow: string;
  title: string;
  description?: string;
  imageUrl?: string;
  accentColor: string;
  badge?: string;
  priceLabel?: string;
  features?: string[];
  endDate?: string | null;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
};

/**
 * Single presentational source of truth for how an offer/package reads
 * visually — reused by the public popup and the Studio preview modal so the
 * two can never drift apart. All color customization funnels through
 * `accentColor` (inline style, since Tailwind can't express an arbitrary
 * per-item runtime color as a utility class).
 */
export function PromoCard({
  kind,
  eyebrow,
  title,
  description,
  imageUrl,
  accentColor,
  badge,
  priceLabel,
  features,
  endDate,
  ctaText,
  ctaHref,
  onCtaClick,
  className,
}: PromoCardProps) {
  if (kind === "image_only") {
    return (
      <div
        className={cn(
          "glass relative w-full overflow-hidden rounded-[1.5rem] border border-white/8",
          className,
        )}
      >
        <a
          href={ctaHref || undefined}
          target={ctaHref?.startsWith("http") ? "_blank" : undefined}
          rel={ctaHref?.startsWith("http") ? "noreferrer noopener" : undefined}
          onClick={onCtaClick}
          aria-label={title}
          className={cn("relative block aspect-[4/3] w-full", !ctaHref && "pointer-events-none")}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
              unoptimized={imageUrl.startsWith("blob:")}
            />
          ) : (
            <PlaceholderArt seed={title.length} label={title} />
          )}
        </a>
      </div>
    );
  }

  const cta: ReactNode =
    ctaText && (ctaHref || onCtaClick) ? (
      <a
        href={ctaHref || "#"}
        target={ctaHref?.startsWith("http") ? "_blank" : undefined}
        rel={ctaHref?.startsWith("http") ? "noreferrer noopener" : undefined}
        onClick={onCtaClick}
        style={{ backgroundColor: accentColor }}
        className="inline-flex h-10 flex-none items-center gap-1.5 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.1em] text-canvas transition-transform hover:scale-[1.03]"
      >
        {ctaText}
        <ArrowUpRight size={14} aria-hidden />
      </a>
    ) : null;

  return (
    <div
      className={cn(
        "glass relative w-full overflow-hidden rounded-[1.5rem] border border-white/8",
        className,
      )}
    >
      {kind !== "announcement" ? (
        <div className="relative aspect-[4/3] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
              unoptimized={imageUrl.startsWith("blob:")}
            />
          ) : (
            <PlaceholderArt seed={title.length} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
          {badge ? (
            <span
              style={{ backgroundColor: accentColor }}
              className="absolute start-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-canvas"
            >
              {badge}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="p-6">
        <p style={{ color: accentColor }} className="text-xs uppercase tracking-[0.2em]">
          {eyebrow}
        </p>
        <p className="mt-1.5 font-display text-2xl leading-snug text-ivory">{title}</p>
        {description ? (
          <p className="text-pretty mt-2 line-clamp-3 text-sm text-ivory/65">{description}</p>
        ) : null}

        {features && features.length > 0 ? (
          <ul className="mt-4 space-y-1.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-ivory/75">
                <Check size={14} style={{ color: accentColor }} className="flex-none" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}

        {endDate ? <Countdown endDate={endDate} className="mt-4" /> : null}

        {priceLabel || cta ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            {priceLabel ? (
              <span className="font-display text-lg text-ivory">{priceLabel}</span>
            ) : (
              <span />
            )}
            {cta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
