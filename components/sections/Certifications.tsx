import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certifications } from "@/data/certifications";

export default function Certifications() {
  const t = useTranslations("certifications");

  return (
    <section id="certifications" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={7}
        />

        <RevealGroup
          stagger={0.08}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {certifications.map(({ id, icon: Icon }) => {
            const honor = t(`items.${id}.honor`);
            return (
              <RevealItem key={id} className="h-full">
                <GlassCard className="group flex h-full flex-col gap-4 p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/25">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-lg text-ivory">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-ivory/60">
                    {t(`items.${id}.issuer`)}
                  </p>
                  {honor ? (
                    <span className="mt-auto inline-flex w-fit items-center rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                      {honor}
                    </span>
                  ) : null}
                </GlassCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
