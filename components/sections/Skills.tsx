import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skills } from "@/data/skills";

export default function Skills() {
  const t = useTranslations("skills");

  return (
    <section id="skills" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={3}
        />

        <RevealGroup
          stagger={0.06}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {skills.map(({ key, icon: Icon }, index) => (
            <RevealItem key={key} variant="liftScale" className="h-full">
              <GlassCard className="group flex h-full flex-col gap-5 p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/25">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm text-gold/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon
                    className="h-5 w-5 text-ivory/45 transition-colors duration-500 group-hover:text-gold"
                    aria-hidden
                  />
                </div>
                <p className="font-display text-lg leading-snug text-ivory">
                  {t(`items.${key}`)}
                </p>
                <span
                  className="mt-auto h-px w-0 bg-gold transition-all duration-500 group-hover:w-12"
                  aria-hidden
                />
              </GlassCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
