"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { stats } from "@/data/stats";

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, reduceMotion, value]);

  return (
    <span ref={ref} className="font-display text-6xl font-medium text-ivory sm:text-7xl lg:text-8xl">
      {reduceMotion ? value : display}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export default function Stats() {
  const t = useTranslations("stats");

  return (
    <section id="stats" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          align="center"
          index={5}
        />

        <RevealGroup
          stagger={0.1}
          delay={0.1}
          className="mt-20 grid grid-cols-2 gap-y-16 sm:grid-cols-4 sm:divide-x sm:divide-white/8 rtl:sm:divide-x-reverse"
        >
          {stats.map((stat) => (
            <RevealItem
              key={stat.id}
              variant="blurUp"
              className="flex flex-col items-center gap-4 text-center"
            >
              <CountUp value={stat.value} suffix={stat.suffix} />
              <p className="text-xs uppercase tracking-[0.25em] text-ivory/55">
                {t(`items.${stat.labelKey}`)}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
