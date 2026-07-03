import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { currentWorkProjects } from "@/data/current-work";

export default function CurrentWork() {
  const t = useTranslations("currentWork");

  return (
    <section id="current-work" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("organization")}
          subheading={t("subheading")}
          index={2}
        />

        <RevealGroup
          stagger={0.08}
          delay={0.1}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <RevealItem>
            <span className="glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-gold">
              {t("period")}
            </span>
          </RevealItem>
        </RevealGroup>

        <RevealGroup
          stagger={0.08}
          delay={0.16}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3"
        >
          {currentWorkProjects.map(({ id, logo }) => {
            const label = t(`projects.${id}`);
            return (
              <RevealItem key={id} variant="scaleIn">
                <GlassCard className="group flex h-full flex-col items-center gap-5 p-8 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/25">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 p-4 text-gold transition-colors duration-500 group-hover:bg-gold/15">
                    <MonoLogo src={logo} label={label} className="h-full w-full" />
                  </span>
                  <p className="font-display text-lg text-ivory">{label}</p>
                </GlassCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
