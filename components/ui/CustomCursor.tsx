"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type CursorVariant = "default" | "hover" | "view";

const sizes: Record<CursorVariant, number> = {
  default: 10,
  hover: 44,
  view: 64,
};

export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reduceMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const activate = () => setEnabled(true);
    activate();
    document.documentElement.classList.add("cursor-none");

    const handleMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement;
      if (target.closest('[data-cursor="view"]')) {
        setVariant("view");
      } else if (target.closest("a, button, [role='button'], input, textarea, select")) {
        setVariant("hover");
      } else {
        setVariant("default");
      }
    };

    const handleLeaveWindow = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
      document.documentElement.classList.remove("cursor-none");
    };
  }, [reduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full border"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: sizes[variant],
        height: sizes[variant],
        opacity: visible ? 1 : 0,
        backgroundColor:
          variant === "default" ? "rgba(246, 243, 236, 1)" : "rgba(246, 243, 236, 0.08)",
        borderColor:
          variant === "default" ? "rgba(246, 243, 236, 0)" : "rgba(246, 243, 236, 0.7)",
      }}
      transition={{
        width: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        default: { duration: 0.25 },
      }}
    >
      {variant === "view" ? (
        <span className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-canvas">
          View
        </span>
      ) : null}
    </motion.div>
  );
}
