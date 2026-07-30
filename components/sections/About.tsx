import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";
import { textScaleStyle } from "@/lib/text-scale-style";

export default function About({
  photoUrl,
  textScale,
}: {
  /** Uploaded from Studio → Settings; falls back to the abstract monogram card when empty. */
  photoUrl?: string | null;
  textScale?: number;
}) {
  const t = useTranslations("about");
  const paragraphs = t("description").split("\n\n");

  return (
    <section
      id="about"
      className="text-scale-section relative py-20 sm:py-32 lg:py-36"
      style={textScaleStyle(textScale)}
    >
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
        <Reveal variant="scaleIn">
          <TiltCard className="glass mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.75rem]">
            {/* Same treatment as Portfolio cards: the image itself zooms
                slightly on hover, independent of the card's own tilt. */}
            <div className="absolute inset-0 transition-transform duration-[1400ms] ease-luxury will-change-transform group-hover:scale-[1.03]">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={siteConfig.name}
                  fill
                  sizes="(min-width: 1024px) 24rem, 90vw"
                  className="object-cover"
                />
              ) : (
                <PlaceholderArt
                  seed={1}
                  monogram={siteConfig.monogram}
                  className="opacity-90"
                />
              )}
            </div>
            {/* Permanent warm glow rising from the bottom edge — matches the
                site's ambient gold lighting language, not a hover effect. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
              style={{
                background:
                  "radial-gradient(ellipse 90% 100% at 50% 100%, rgba(238, 223, 122, 0.3) 0%, transparent 70%)",
              }}
            />
          </TiltCard>
        </Reveal>

        <Reveal variant="fadeRight" delay={0.15}>
          <SectionHeading eyebrow={t("eyebrow")} heading={t("title")} index={1} />

          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={cn(
                "text-pretty text-lg leading-relaxed text-ivory/65 sm:text-xl",
                i === 0 ? "mt-8" : "mt-5",
              )}
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
