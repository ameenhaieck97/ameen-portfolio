"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const lineVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

const nameWordVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

// Fixed (non-random) positions/timings so server and client markup match.
const particles = [
  { left: "12%", top: "22%", size: 3, duration: 9, delay: 0 },
  { left: "82%", top: "18%", size: 2, duration: 11, delay: 1.2 },
  { left: "68%", top: "62%", size: 2.5, duration: 8, delay: 0.6 },
  { left: "24%", top: "72%", size: 2, duration: 10, delay: 2 },
  { left: "50%", top: "14%", size: 2, duration: 12, delay: 0.4 },
  { left: "90%", top: "48%", size: 3, duration: 9.5, delay: 1.6 },
];

export default function Hero() {
  const t = useTranslations("hero");
  const tMeta = useTranslations("meta");
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Purely scroll-position driven: at scrollYProgress 0 (page load) every
  // value below is at rest, so nothing animates until the user scrolls.
  const bgY = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["0%", "0%"] : ["0%", "16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], reduceMotion ? [1, 1] : [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -56]);

  // Cursor-reactive background drift — desktop fine-pointer only, disabled
  // under prefers-reduced-motion.
  const mouseX = useSpring(0, { stiffness: 55, damping: 20, mass: 0.6 });
  const mouseY = useSpring(0, { stiffness: 55, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMove = (event: MouseEvent) => {
      const relX = event.clientX / window.innerWidth - 0.5;
      const relY = event.clientY / window.innerHeight - 0.5;
      mouseX.set(relX * 36);
      mouseY.set(relY * 28);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reduceMotion, mouseX, mouseY]);

  const headingLines = t.raw("headingLines") as string[];
  const nameWords = tMeta("titleShort").split(" ");

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-[100vh] items-center overflow-hidden pt-28"
    >
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0">
        {/* Cinematic black → deep-blue → brand-canvas gradient, scoped to Hero */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #08090d 0%, #12131a 32%, #201f24 62%, var(--color-canvas) 100%)",
          }}
        />
        <motion.div
          style={{ x: mouseX, y: mouseY }}
          className="absolute inset-0 scale-110"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-ivory) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ivory) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 60% 55% at 50% 40%, black 0%, transparent 75%)",
            }}
          />
          <div className="absolute left-1/2 top-[28%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4a5578]/15 blur-[150px]" />
          <div className="absolute left-1/2 top-[38%] h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/8 blur-[130px]" />
          <div className="absolute -right-32 bottom-0 h-[50vh] w-[50vh] rounded-full bg-gold/5 blur-[120px]" />
          <MonoLogo
            decorative
            src={siteConfig.logo}
            label=""
            color="var(--color-ivory)"
            className="absolute inset-0 m-auto h-[52vw] w-[52vw] max-h-[85vh] max-w-[85vh] opacity-[0.05]"
          />
          {reduceMotion
            ? null
            : particles.map((p, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute rounded-full bg-gold"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.size,
                    height: p.size,
                  }}
                  animate={{ y: [0, -22, 0], opacity: [0.15, 0.55, 0.15] }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10"
      >
        <RevealGroup stagger={0.16}>
          <RevealItem className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold/60" aria-hidden />
              {t("eyebrow")}
            </span>
            <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-ivory/70">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              {t("status")}
            </span>
          </RevealItem>

          <RevealItem>
            <h1 className="flex items-center gap-4 font-display text-[15vw] font-medium leading-[0.94] sm:text-[10vw] lg:text-[7.5vw]">
              <MonoLogo
                src={siteConfig.logo}
                label=""
                decorative
                className="hidden h-[0.6em] w-[0.6em] flex-none sm:block"
              />
              <motion.span
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
              >
                {nameWords.map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    variants={reduceMotion ? undefined : nameWordVariants}
                    className={cn("block", i === 0 ? "text-ivory" : "text-ivory/40")}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.span>
            </h1>
          </RevealItem>

          <RevealItem>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
              className="mt-8 max-w-xl font-display text-xl leading-snug text-ivory/80 sm:text-2xl"
            >
              {headingLines.map((line, i) => (
                <motion.span
                  key={`${line}-${i}`}
                  variants={reduceMotion ? undefined : lineVariants}
                  className="block"
                >
                  {line}
                </motion.span>
              ))}
            </motion.p>
          </RevealItem>

          <RevealItem>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/60 sm:text-lg">
              {t("tagline")}
            </p>
          </RevealItem>

          <RevealItem className="mt-12 flex flex-wrap items-center gap-5">
            <Magnetic>
              <Button href="#portfolio" variant="primary">
                {t("ctaPrimary")}
              </Button>
            </Magnetic>
            <Magnetic>
              <Button href="#contact" variant="ghost">
                {t("ctaSecondary")}
              </Button>
            </Magnetic>
          </RevealItem>
        </RevealGroup>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-ivory/40">
          {t("scrollHint")}
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-gold/60 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
