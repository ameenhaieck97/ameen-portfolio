import { useLocale, useTranslations } from "next-intl";
import { GlassCard } from "@/components/ui/GlassCard";
import { Marquee } from "@/components/ui/Marquee";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { partners } from "@/data/partners";

export default function Partners() {
  const t = useTranslations("partners");
  const locale = useLocale() as "en" | "ar";

  return (
    <section id="partners" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          align="center"
          index={8}
        />
      </div>

      <Reveal variant="fadeIn" delay={0.15} className="mt-16">
        <Marquee>
          {partners.map((partner) => {
            const name = partner.name[locale];
            return (
              <GlassCard
                key={partner.id}
                className="group flex h-44 w-80 flex-none items-center justify-center px-10 text-center transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-gold/25 hover:shadow-[0_0_40px_rgba(238,223,122,0.14)]"
              >
                {partner.logo ? (
                  <MonoLogo
                    src={partner.logo}
                    label={name}
                    className="h-24 w-full opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                  />
                ) : (
                  <span className="font-display text-lg tracking-wide text-ivory/65 transition-colors duration-500 group-hover:text-gold">
                    {name}
                  </span>
                )}
              </GlassCard>
            );
          })}
        </Marquee>
      </Reveal>
    </section>
  );
}
