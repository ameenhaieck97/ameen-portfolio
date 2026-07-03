"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealVariant =
  | "fadeUp"
  | "fadeIn"
  | "scaleIn"
  | "fadeRight"
  | "fadeLeft"
  | "blurUp"
  | "liftScale"
  | "clipReveal";

const EASE = [0.16, 1, 0.3, 1] as const;

const itemVariants: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 36 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -36 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
  },
  blurUp: {
    hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: EASE },
    },
  },
  liftScale: {
    hidden: { opacity: 0, y: 44, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.75, ease: EASE },
    },
  },
  clipReveal: {
    hidden: {
      opacity: 1,
      scale: 0.97,
      clipPath: "inset(0 0 100% 0 round 1.5rem)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      clipPath: "inset(0 0 0% 0 round 1.5rem)",
      transition: { duration: 0.85, ease: EASE },
    },
  },
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  once = true,
  className,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={reduceMotion ? itemVariants.fadeIn : itemVariants[variant]}
      transition={{ delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: reduceMotion ? 0 : stagger,
            delayChildren: reduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  variant = "fadeUp",
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? itemVariants.fadeIn : itemVariants[variant]}
    >
      {children}
    </motion.div>
  );
}
