import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="relative py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
        <Reveal variant="scaleIn">
          <GlassCard className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden">
            <PlaceholderArt
              seed={1}
              monogram={siteConfig.monogram}
              className="opacity-90"
            />
            <div className="glass absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl px-5 py-4">
              <span className="text-xs uppercase tracking-[0.2em] text-ivory/60">
                {t("sinceLabel")}
              </span>
              <span className="font-display text-2xl text-gold">2015</span>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal variant="fadeRight" delay={0.15}>
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} index={1} />

          <p className="mt-8 font-display text-2xl leading-relaxed text-ivory/90 sm:text-3xl">
            {t("paragraph1")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
