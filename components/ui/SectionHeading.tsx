import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "start",
  index,
  className,
  size = "default",
}: {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "start" | "center";
  /** Renders a large faint editorial numeral (e.g. 1 → "01") beside the heading */
  index?: number;
  className?: string;
  /** "display" renders an oversized headline for climactic sections (e.g. closing CTA) */
  size?: "default" | "display";
}) {
  return (
    <div
      className={cn(
        "relative max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {typeof index === "number" ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-6 font-display text-8xl font-medium text-ivory/[0.05] sm:-top-8 sm:text-9xl",
            align === "center"
              ? "left-1/2 -translate-x-1/2"
              : "[inset-inline-start:-0.5rem]",
          )}
        >
          {String(index).padStart(2, "0")}
        </span>
      ) : null}
      {eyebrow ? (
        <Reveal variant="fadeUp">
          <span
            className={cn(
              "mb-4 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-gold",
              align === "center" && "justify-center",
            )}
          >
            <span className="h-px w-8 bg-gold/50" aria-hidden />
            {eyebrow}
          </span>
        </Reveal>
      ) : null}
      <Reveal variant="blurUp" delay={0.08}>
        <h2
          className={cn(
            "text-balance font-display font-medium text-ivory",
            size === "display"
              ? "text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
              : "text-4xl leading-[1.12] sm:text-5xl",
          )}
        >
          {heading}
        </h2>
      </Reveal>
      {subheading ? (
        <Reveal variant="fadeUp" delay={0.16}>
          <p
            className={cn(
              "leading-relaxed text-ivory/65",
              size === "display" ? "mt-6 text-xl" : "mt-5 text-lg",
            )}
          >
            {subheading}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
