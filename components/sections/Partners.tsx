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
    <section id="partners" className="relative py-20 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          align="center"
          index={6}
        />
      </div>

      {/* Compact elegant strip on phones (echoing the ticker's rhythm),
          full glass cards from tablet up. */}
      <Reveal variant="fadeIn" delay={0.15} className="mt-10 sm:mt-16">
        <Marquee>
          {partners.map((partner) => {
            const name = partner.name[locale];
            return (
              <div
                key={partner.id}
                className="glass-reveal group flex h-20 w-44 flex-none items-center justify-center rounded-2xl px-6 text-center transition-transform duration-700 ease-luxury hover:-translate-y-1 hover:scale-[1.02] sm:h-44 sm:w-80 sm:rounded-[1.75rem] sm:px-10"
              >
                {partner.logo ? (
                  <MonoLogo
                    src={partner.logo}
                    label={name}
                    className="h-8 w-[76%] opacity-80 transition-opacity duration-700 ease-luxury group-hover:opacity-100 sm:h-16"
                  />
                ) : (
                  <span className="font-display text-sm tracking-wide text-ivory/65 transition-colors duration-700 ease-luxury group-hover:text-gold sm:text-lg">
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
