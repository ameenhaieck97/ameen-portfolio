"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/Reveal";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { PortfolioLightbox, type PortfolioSlide } from "@/components/portfolio/Lightbox";
import { currentWorkProjects, instituteHub, type CurrentWorkProject } from "@/data/current-work";
import { experience } from "@/data/experience";
import { textScaleStyle } from "@/lib/text-scale-style";
import { trackPromoEvent } from "@/lib/promo-track";

type StatEntry = { value: string; label: string };

// Not part of the translation schema (this stat is a client-computed
// addition, not content from the CMS/JSON) — kept as a tiny in-component
// lookup instead of a JSON key, matching the pattern used elsewhere in this
// file for non-content microcopy.
const YEARS_LABEL = { en: "Years of Experience", ar: "سنوات خبرة" };

// Stat values are free-form strings ("+500", "150+", "100%", "Since 2015")
// rather than bare numbers. A value that's a number with an optional
// leading and/or trailing symbol (e.g. "+500", "100%") animates as a
// count-up, preserving whichever side the symbol was written on. A value
// mentioning a year (e.g. "Since 2015") animates as a count-down from the
// current year to that year instead, since counting up from 0 wouldn't
// mean anything for a year.
function parseStat(value: string): { count: number; prefix: string; suffix: string } | null {
  const match = /^(\D*)(\d+)(\D*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  return { count: Number(digits), prefix, suffix };
}

function parseYear(value: string): number | null {
  const match = /(\d{4})/.exec(value);
  return match ? Number(match[1]) : null;
}

const LUX_EASE = [0.16, 1, 0.3, 1] as const;

const dotVariants: Variants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

// Horizontal attachment points for the three branch lines, as a percentage
// of the node row's width — matches the natural center of each column in
// the 3-column grid below closely enough for a decorative connector.
const BRANCH_POSITIONS = [16.6, 50, 83.4] as const;

function InstituteEcosystem({ galleries }: { galleries: Record<string, string[]> }) {
  const tCurrent = useTranslations("currentWork");
  const locale = useLocale() as "en" | "ar";
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-15% 0px" });
  const show = reduceMotion || isInView;
  const [openId, setOpenId] = useState<string | null>(null);
  const handleOpen = (id: string) => {
    setOpenId(id);
    trackPromoEvent("current_work", id, "view");
  };

  // The "projects" array is flat: index 0 is the institute hub itself,
  // followed by each satellite project in the same order as
  // currentWorkProjects — positional, since these are now plain strings
  // rather than an object keyed by project id.
  const projectNames = tCurrent.raw("projects") as string[];
  const projectLabel = (project: CurrentWorkProject) => {
    if (project.id === "institute") return projectNames[0];
    const index = currentWorkProjects.findIndex((p) => p.id === project.id);
    return projectNames[index + 1];
  };

  const openProject = currentWorkProjects
    .concat(instituteHub)
    .find((project) => project.id === openId);

  const galleryCount = (id: string) => galleries[id]?.length ?? 0;

  const slides: PortfolioSlide[] = useMemo(() => {
    if (!openProject) return [];
    const designs = galleries[openProject.id] ?? [];
    if (designs.length > 0) {
      return designs.map((src, i) => ({
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
  }, [openProject?.id, locale, galleries]);

  return (
    <div ref={containerRef}>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-gold">
        {tCurrent("period")}
      </span>
      <p className="mt-2 font-display text-2xl text-ivory sm:text-3xl">
        {tCurrent("title")}
      </p>
      <p className="text-pretty mt-2 max-w-lg text-ivory/60">{tCurrent("description")}</p>

      {/* Hub — the institute, presented as the same rounded glass panel
          used everywhere else on the site */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.8, ease: LUX_EASE }}
        className="mt-10"
      >
        <TiltCard
          onClick={() => handleOpen("institute")}
          ariaLabel={projectNames[0]}
          className="glass flex w-full items-center gap-5 rounded-[1.75rem] p-6 text-start sm:p-7"
        >
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-gold/10 p-4 text-gold transition-transform duration-500 ease-luxury group-hover:scale-110 sm:h-20 sm:w-20 sm:p-5">
            <MonoLogo
              src={instituteHub.logo}
              label={projectNames[0]}
              className="h-full w-full"
            />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg text-ivory sm:text-xl">
              {projectNames[0]}
            </p>
            <p className="mt-1 max-h-0 overflow-hidden text-xs text-gold/70 opacity-0 transition-all duration-300 ease-luxury group-hover:max-h-5 group-hover:opacity-100 [@media(hover:none)]:max-h-5 [@media(hover:none)]:opacity-100">
              {tCurrent("viewSelectedWork")}
            </p>
          </div>
          {/* Logical end-* (not right-*) so this sits opposite the logo —
              the logo is the first flex child, which a row layout places at
              the inline-start corner (right in RTL, left in LTR); the badge
              takes the other corner in both directions instead of always
              landing on the same side as the logo. Visible without hover on
              touch devices (hover:none), since nothing else there hints
              these cards are tappable. */}
          <span className="pointer-events-none absolute end-4 top-4 flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold opacity-0 transition-opacity duration-300 ease-luxury group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            {galleryCount("institute") > 0 ? <span>{galleryCount("institute")}</span> : null}
            <ArrowUpRight size={12} aria-hidden />
          </span>
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
              onClick={() => handleOpen(project.id)}
              ariaLabel={projectLabel(project)}
              className="glass-reveal flex w-full items-center gap-4 rounded-2xl p-5 text-start sm:flex-col sm:gap-3 sm:p-6 sm:text-center"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gold/12 p-2.5 text-gold transition-transform duration-500 ease-luxury group-hover:scale-110 sm:h-14 sm:w-14 sm:p-3">
                <MonoLogo
                  src={project.logo}
                  label={projectLabel(project)}
                  className="h-full w-full"
                />
              </span>
              <span className="flex flex-col sm:items-center">
                <span className="text-sm font-medium leading-snug text-ivory/80">
                  {projectLabel(project)}
                </span>
                <span className="max-h-0 overflow-hidden text-[11px] text-gold/70 opacity-0 transition-all duration-300 ease-luxury group-hover:max-h-5 group-hover:opacity-100 [@media(hover:none)]:max-h-5 [@media(hover:none)]:opacity-100">
                  {tCurrent("viewSelectedWork")}
                </span>
              </span>
              <span className="pointer-events-none absolute end-3 top-3 flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold opacity-0 transition-opacity duration-300 ease-luxury group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                {galleryCount(project.id) > 0 ? <span>{galleryCount(project.id)}</span> : null}
                <ArrowUpRight size={11} aria-hidden />
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

// The dashed gold ring each stat number sits inside — echoes the site's
// earlier "dashed dial" stat treatment.
function StatRing({ children }: { children: ReactNode }) {
  return (
    <span className="relative flex h-32 w-32 flex-none items-center justify-center rounded-full border-2 border-dashed border-gold/45 sm:h-36 sm:w-36 lg:h-40 lg:w-40">
      {children}
    </span>
  );
}

function CountUp({
  value,
  prefix,
  suffix,
}: {
  value: number;
  prefix: string;
  suffix: string;
}) {
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
    <span ref={ref} className="font-display text-3xl font-medium text-ivory sm:text-4xl lg:text-5xl">
      {prefix ? <span className="text-gold">{prefix}</span> : null}
      {reduceMotion ? value : display}
      {suffix ? <span className="text-gold">{suffix}</span> : null}
    </span>
  );
}

// Counts down from the current year to a target year (e.g. "Since 2015") —
// the same count mechanic as CountUp, just descending, since counting up
// from 0 wouldn't mean anything for a calendar year.
function CountDown({ from, to }: { from: number; to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!isInView || reduceMotion) return;
    const controls = animate(from, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, reduceMotion, from, to]);

  return (
    <span ref={ref} className="font-display text-3xl font-medium text-ivory sm:text-4xl lg:text-5xl">
      {reduceMotion ? to : display}
    </span>
  );
}

export default function ExperienceImpact({
  currentWorkGalleries,
  textScale,
}: {
  /** Supplied by the server from the CMS; falls back to empty galleries. */
  currentWorkGalleries?: Record<string, string[]>;
  textScale?: number;
}) {
  const tExperience = useTranslations("experience");
  const locale = useLocale() as "en" | "ar";
  const messages = useMessages() as { stats: StatEntry[] };
  // Lazy state initializer (not a bare call in the render body) so the
  // current year is read exactly once per mount rather than on every render.
  const [currentYear] = useState(() => new Date().getFullYear());
  const stats: StatEntry[] = [
    { value: `+${currentYear - 2015}`, label: YEARS_LABEL[locale] },
    ...messages.stats,
  ];
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 85%", "end 65%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0, 1]);

  return (
    <section
      id="experience"
      className="text-scale-section relative py-20 sm:py-32 lg:py-36"
      style={textScaleStyle(textScale)}
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={tExperience("eyebrow")}
          heading={tExperience("title")}
          subheading={tExperience("description")}
          index={4}
        />

        {/* Currently — the Al-Mustafa Institute ecosystem */}
        <Reveal variant="fadeUp" delay={0.1} className="mt-14">
          <InstituteEcosystem galleries={currentWorkGalleries ?? {}} />
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
                <p className="text-pretty mt-1.5 text-sm leading-relaxed text-ivory/60">
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
          {stats.map((stat) => {
            // Check year-shaped values ("Since 2015") first — a 4-digit
            // year plus surrounding words would otherwise also match the
            // generic count parser below and never reach the count-down.
            const targetYear = parseYear(stat.value);
            const parsed = targetYear ? null : parseStat(stat.value);
            return (
              <RevealItem
                key={stat.label}
                variant="blurUp"
                className="flex flex-col items-center gap-4 text-center"
              >
                <StatRing>
                  {targetYear ? (
                    <CountDown from={currentYear} to={targetYear} />
                  ) : parsed ? (
                    <CountUp value={parsed.count} prefix={parsed.prefix} suffix={parsed.suffix} />
                  ) : (
                    <span className="font-display text-2xl font-medium text-ivory sm:text-3xl">
                      {stat.value}
                    </span>
                  )}
                </StatRing>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/55">{stat.label}</p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
