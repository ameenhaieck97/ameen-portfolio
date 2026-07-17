"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

// Fixed (non-random) positions/timings so server and client markup match,
// and spaced down the full page height so particles keep appearing as the
// user scrolls rather than only sitting near the top.
const particles = [
  { left: "8%", top: "12%", size: 2, duration: 14, delay: 0 },
  { left: "92%", top: "22%", size: 2.5, duration: 17, delay: 2 },
  { left: "50%", top: "8%", size: 2, duration: 15, delay: 4 },
  { left: "18%", top: "38%", size: 2, duration: 16, delay: 1 },
  { left: "80%", top: "46%", size: 2.5, duration: 13, delay: 3 },
  { left: "35%", top: "58%", size: 2, duration: 18, delay: 5 },
  { left: "65%", top: "68%", size: 2, duration: 15, delay: 2.5 },
  { left: "10%", top: "78%", size: 2.5, duration: 17, delay: 0.5 },
  { left: "90%", top: "86%", size: 2, duration: 14, delay: 4.5 },
  { left: "45%", top: "94%", size: 2, duration: 16, delay: 3.5 },
];

/**
 * Fixed, viewport-pinned ambient backdrop shared by every section after the
 * Hero. Reuses the same gradient/grid/glow/particle language as the Hero's
 * own background so scrolling from Hero into the rest of the page feels
 * continuous instead of cutting to a flat canvas color. Positioned at a
 * shallow negative z-index with `background-attachment`-free `fixed`
 * placement so it always paints above the page's own background color and
 * behind every section's content.
 */
export function SiteBackground() {
  const reduceMotion = useReducedMotion();

  // Same cursor-reactive drift as Hero, so the whole site — not just the
  // opening section — responds to the cursor. Desktop fine-pointer only.
  // Stronger than Hero's own multiplier since this layer is mostly large,
  // heavily blurred glow shapes that need more travel to read as motion.
  const mouseX = useSpring(0, { stiffness: 45, damping: 18, mass: 0.6 });
  const mouseY = useSpring(0, { stiffness: 45, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handleMove = (event: MouseEvent) => {
      const relX = event.clientX / window.innerWidth - 0.5;
      const relY = event.clientY / window.innerHeight - 0.5;
      mouseX.set(relX * 70);
      mouseY.set(relY * 55);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reduceMotion, mouseX, mouseY]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0b10 0%, #14151c 28%, #1c1b20 58%, var(--color-canvas) 100%)",
        }}
      />
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        className="absolute inset-0 scale-110"
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-ivory) 1px, transparent 1px), linear-gradient(to bottom, var(--color-ivory) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 0%, black 0%, transparent 80%)",
          }}
        />
        {/* Ambient light sources, spread across the whole viewport so every
            part of the screen carries some faint illumination rather than
            fading to a flat, unlit canvas — echoing Hero's lighting. Each
            one drifts on its own slow, independent loop (a restrained take
            on a "bubble" background: soft radial light, not a colorful
            floating shape) so the atmosphere feels alive without ever
            drawing the eye away from the content in front of it. */}
        <div
          className="bubble animate-bubble-1 absolute left-1/2 top-[-8%] h-[62vh] w-[62vh] -translate-x-1/2 rounded-full blur-[90px]"
          style={{
            background: "radial-gradient(circle, rgba(74,85,120,0.16) 0%, transparent 70%)",
          }}
        />
        <div
          className="bubble animate-bubble-2 absolute -right-20 top-[18%] h-[46vh] w-[46vh] rounded-full blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(238,223,122,0.09) 0%, transparent 70%)",
          }}
        />
        <div
          className="bubble animate-bubble-3 absolute -left-20 top-1/2 h-[40vh] w-[40vh] -translate-y-1/2 rounded-full blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(238,223,122,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="bubble animate-bubble-4 absolute -right-16 bottom-[-6%] h-[44vh] w-[44vh] rounded-full blur-[85px]"
          style={{
            background: "radial-gradient(circle, rgba(238,223,122,0.08) 0%, transparent 70%)",
          }}
        />
        {reduceMotion
          ? null
          : particles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-gold"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                }}
                animate={{ y: [0, -18, 0], opacity: [0.1, 0.35, 0.1] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
      </motion.div>
    </div>
  );
}
