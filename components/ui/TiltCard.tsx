"use client";

import { useRef, type MouseEvent, type ReactNode, type Ref } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Shared cursor-tilt + glow treatment used by Portfolio cards and any other
 * card that should feel like the same interactive object. Wrapping div
 * supplies the `perspective` needed for rotateX/rotateY to actually read as
 * a 3D tilt instead of near-invisible flat shearing.
 */
export function TiltCard({
  children,
  className,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const cardRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 20, mass: 0.6 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 20, mass: 0.6 });
  const glowX = useTransform(rotateY, [-10, 10], ["25%", "75%"]);
  const glowY = useTransform(rotateX, [10, -10], ["25%", "75%"]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const rect = el.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * 10);
    rotateX.set(relY * -10);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const motionProps = {
    style: { rotateX, rotateY },
    whileHover: { y: -4 },
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  const sharedClassName = cn(
    "group relative isolate [transform-style:preserve-3d]",
    className,
  );

  const glow = (
    <motion.span
      aria-hidden
      style={{ left: glowX, top: glowY }}
      className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 opacity-0 blur-3xl transition-opacity duration-700 ease-luxury group-hover:opacity-100"
    />
  );

  return (
    <div className="[perspective:1200px]">
      {onClick ? (
        <motion.button
          ref={cardRef as Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          data-cursor="view"
          className={sharedClassName}
          {...motionProps}
        >
          {glow}
          {children}
        </motion.button>
      ) : (
        <motion.div
          ref={cardRef as Ref<HTMLDivElement>}
          className={sharedClassName}
          {...motionProps}
        >
          {glow}
          {children}
        </motion.div>
      )}
    </div>
  );
}
