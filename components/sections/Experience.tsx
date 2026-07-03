"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experience } from "@/data/experience";

const dotVariants: Variants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

export default function Experience() {
  const t = useTranslations("experience");
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 85%", "end 65%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);

  return (
    <section id="experience" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          index={6}
        />

        <div ref={trackRef} className="relative mt-16">
          <div
            className="absolute inset-y-0 start-1 w-px bg-white/10 sm:start-1.5"
            aria-hidden
          />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute inset-y-0 start-1 w-px origin-top bg-gradient-to-b from-gold via-gold/50 to-transparent sm:start-1.5"
            aria-hidden
          />
          <RevealGroup stagger={0.08} className="space-y-10">
            {experience.map((item) => (
              <RevealItem
                key={item.id}
                className="relative ps-8 sm:ps-10"
              >
                <motion.span
                  variants={dotVariants}
                  className="absolute start-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gold rtl:translate-x-1/2 sm:h-3 sm:w-3"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-lg text-ivory sm:text-xl">
                    {t(`items.${item.id}.company`)}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
                    {item.start} – {item.end === "present" ? t("present") : item.end}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">
                  {t(`items.${item.id}.role`)}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
