import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certifications } from "@/data/certifications";

export default function Certifications() {
  const t = useTranslations("certifications");

  return (
    <section id="certifications" className="relative py-20 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={5}
        />

        <RevealGroup
          stagger={0.08}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5"
        >
          {certifications.map(({ id, icon: Icon }) => {
            const honor = t(`items.${id}.honor`);
            return (
              <RevealItem key={id} className="h-full">
                <GlassCard
                  variant="reveal"
                  className="group flex h-full flex-row items-start gap-4 p-5 transition-all duration-700 ease-luxury hover:-translate-y-1.5 sm:flex-col sm:p-7"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 sm:contents">
                  <h3 className="font-display text-base text-ivory sm:text-lg">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ivory/60 sm:mt-0">
                    {t(`items.${id}.issuer`)}
                  </p>
                  {honor ? (
                    <span className="mt-2 inline-flex w-fit items-center rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold sm:mt-auto">
                      {honor}
                    </span>
                  ) : null}
                  </div>
                </GlassCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
