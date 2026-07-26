import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";

export default function About({
  photoUrl,
}: {
  /** Uploaded from Studio → Settings; falls back to the abstract monogram card when empty. */
  photoUrl?: string | null;
}) {
  const t = useTranslations("about");
  const paragraphs = t("description").split("\n\n");

  return (
    <section id="about" className="relative py-20 sm:py-32 lg:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
        <Reveal variant="scaleIn">
          <GlassCard className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
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
          </GlassCard>
        </Reveal>

        <Reveal variant="fadeRight" delay={0.15}>
          <SectionHeading eyebrow={t("eyebrow")} heading={t("title")} index={1} />

          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={cn(
                "text-lg leading-relaxed text-ivory/65 sm:text-xl",
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
