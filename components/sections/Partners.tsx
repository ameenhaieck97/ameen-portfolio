import { useLocale, useTranslations } from "next-intl";
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
          index={6}
        />
      </div>

      <Reveal variant="fadeIn" delay={0.15} className="mt-16">
        <Marquee>
          {partners.map((partner) => {
            const name = partner.name[locale];
            return (
              <div
                key={partner.id}
                className="glass-reveal group flex h-44 w-80 flex-none items-center justify-center rounded-[1.75rem] px-10 text-center hover:-translate-y-1 hover:scale-[1.02]"
              >
                {partner.logo ? (
                  <MonoLogo
                    src={partner.logo}
                    label={name}
                    className="h-16 w-[80%] opacity-80 transition-opacity duration-700 ease-luxury group-hover:opacity-100"
                  />
                ) : (
                  <span className="font-display text-lg tracking-wide text-ivory/65 transition-colors duration-700 ease-luxury group-hover:text-gold">
                    {name}
                  </span>
                )}
              </div>
            );
          })}
        </Marquee>
      </Reveal>
    </section>
  );
}
