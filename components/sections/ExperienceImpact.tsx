"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/Reveal";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { PortfolioLightbox, type PortfolioSlide } from "@/components/portfolio/Lightbox";
import { currentWorkProjects, instituteHub, type CurrentWorkProject } from "@/data/current-work";
import { experience } from "@/data/experience";
import { stats } from "@/data/stats";

const LUX_EASE = [0.16, 1, 0.3, 1] as const;

const dotVariants: Variants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

// Horizontal attachment points for the three branch lines, as a percentage
// of the node row's width — matches the natural center of each column in
// the 3-column grid below closely enough for a decorative connector.
const BRANCH_POSITIONS = [16.6, 50, 83.4] as const;

function InstituteEcosystem() {
  const tCurrent = useTranslations("currentWork");
  const locale = useLocale() as "en" | "ar";
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-15% 0px" });
  const show = reduceMotion || isInView;
  const [openId, setOpenId] = useState<string | null>(null);

  const projectLabel = (project: CurrentWorkProject) =>
    project.id === "institute" ? tCurrent("organization") : tCurrent(`projects.${project.id}`);

  const openProject = currentWorkProjects
    .concat(instituteHub)
    .find((project) => project.id === openId);

  const slides: PortfolioSlide[] = useMemo(() => {
    if (!openProject) return [];
    if (openProject.designs.length > 0) {
      return openProject.designs.map((src, i) => ({
        src,
        alt: projectLabel(openProject),
        title: projectLabel(openProject),
        category: tCurrent("categoryLabel"),
        seed: i + 1,
      }));
    }
    return [
      {
        src: "",
        alt: projectLabel(openProject),
        title: projectLabel(openProject),
        category: tCurrent("comingSoon"),
        seed: 1,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProject?.id, locale]);

  return (
    <div ref={containerRef}>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
        {tCurrent("period")}
      </span>
      <p className="mt-2 font-display text-2xl text-ivory sm:text-3xl">
        {tCurrent("organization")}
      </p>
      <p className="mt-2 max-w-lg text-ivory/60">{tCurrent("subheading")}</p>

      {/* Hub — the institute, presented as the same rounded glass panel
          used everywhere else on the site */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.8, ease: LUX_EASE }}
        className="mt-10"
      >
        <TiltCard
          onClick={() => setOpenId("institute")}
          ariaLabel={tCurrent("organization")}
          className="glass flex w-full items-center gap-5 rounded-[1.75rem] p-6 text-start sm:p-7"
        >
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-gold/10 p-4 text-gold sm:h-20 sm:w-20 sm:p-5">
            <MonoLogo
              src={instituteHub.logo}
              label={tCurrent("organization")}
              className="h-full w-full"
            />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg text-ivory sm:text-xl">
              {tCurrent("organization")}
            </p>
            <p className="mt-1 text-sm text-ivory/55">{tCurrent("subheading")}</p>
          </div>
        </TiltCard>
      </motion.div>

      {/* Connector — a trunk line merging into a horizontal bar, branching
          down into each project card, mirroring the career timeline's own
          animated-line technique below for a consistent motion language. */}
      <div className="mx-auto h-6 w-px" aria-hidden>
        <div className="relative h-full w-full">
          <div className="absolute inset-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <motion.div
            className="absolute inset-0 left-1/2 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-gold to-gold/40"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: show ? 1 : 0 }}
            transition={{ duration: 0.5, ease: LUX_EASE }}
          />
        </div>
      </div>
      <div className="relative mx-auto h-6 max-w-2xl" aria-hidden>
        <div
          className="absolute inset-x-[16.6%] top-0 h-px bg-white/10"
        />
        <motion.div
          className="absolute inset-x-[16.6%] top-0 h-px origin-center bg-gradient-to-r from-gold/40 via-gold to-gold/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: show ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: LUX_EASE }}
        />
        {BRANCH_POSITIONS.map((left, i) => (
          <div key={left} className="absolute top-0 h-full w-px" style={{ left: `${left}%` }}>
            <div className="absolute inset-0 w-px bg-white/10" />
            <motion.div
              className="absolute inset-0 w-px origin-top bg-gradient-to-b from-gold to-gold/40"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: show ? 1 : 0 }}
              transition={{ duration: 0.45, delay: 0.4 + i * 0.1, ease: LUX_EASE }}
            />
          </div>
        ))}
      </div>

      {/* Nodes — the three projects, as rounded glass cards matching
          Skills/Certifications, not free-floating circles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {currentWorkProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 14 }}
            animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ duration: 0.7, delay: 0.6 + i * 0.1, ease: LUX_EASE }}
          >
            <TiltCard
              onClick={() => setOpenId(project.id)}
              ariaLabel={projectLabel(project)}
              className="glass-reveal flex w-full items-center gap-4 rounded-2xl p-5 text-start sm:flex-col sm:gap-3 sm:p-6 sm:text-center"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gold/12 p-2.5 text-gold sm:h-14 sm:w-14 sm:p-3">
                <MonoLogo
                  src={project.logo}
                  label={projectLabel(project)}
                  className="h-full w-full"
                />
              </span>
              <span className="text-sm font-medium leading-snug text-ivory/80">
                {projectLabel(project)}
              </span>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <PortfolioLightbox
        slides={slides}
        index={openId ? 0 : -1}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

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
    <span ref={ref} className="font-display text-5xl font-medium text-ivory sm:text-6xl lg:text-7xl">
      {reduceMotion ? value : display}
      <span className="text-gold">{suffix}</span>
    </span>
  );
}

export default function ExperienceImpact() {
  const tImpact = useTranslations("experienceImpact");
  const tExperience = useTranslations("experience");
  const tStats = useTranslations("stats");
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
          eyebrow={tImpact("eyebrow")}
          heading={tImpact("heading")}
          subheading={tImpact("subheading")}
          index={4}
        />

        {/* Currently — the Al-Mustafa Institute ecosystem */}
        <Reveal variant="fadeUp" delay={0.1} className="mt-14">
          <InstituteEcosystem />
        </Reveal>

        {/* Career timeline */}
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
              <RevealItem key={item.id} className="relative ps-8 sm:ps-10">
                <motion.span
                  variants={dotVariants}
                  className="absolute start-1 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gold rtl:translate-x-1/2 sm:start-1.5 sm:h-3 sm:w-3"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-lg text-ivory sm:text-xl">
                    {tExperience(`items.${item.id}.company`)}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
                    {item.end === "present"
                      ? `${item.start} – ${tExperience("present")}`
                      : item.start}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">
                  {tExperience(`items.${item.id}.role`)}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Impact in numbers */}
        <RevealGroup
          stagger={0.1}
          delay={0.1}
          className="mt-20 grid grid-cols-2 gap-y-12 border-t border-white/8 pt-16 sm:grid-cols-4 sm:divide-x sm:divide-white/8 rtl:sm:divide-x-reverse"
        >
          {stats.map((stat) => (
            <RevealItem
              key={stat.id}
              variant="blurUp"
              className="flex flex-col items-center gap-3 text-center"
            >
              <CountUp value={stat.value} suffix={stat.suffix} />
              <p className="text-xs uppercase tracking-[0.2em] text-ivory/55">
                {tStats(`items.${stat.labelKey}`)}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
