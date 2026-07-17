"use client";

import { useRef, type ElementType, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  as,
  spotlight = true,
  variant = "glass",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Cursor-tracking gold glow, on by default for description/content cards */
  spotlight?: boolean;
  /**
   * "glass" is a permanent liquid-glass surface, reserved for featured/
   * premium elements. "reveal" keeps the card transparent by default and
   * only materializes glass on hover — for secondary, repeated cards where
   * permanent glass on every item would read as one solid block.
   */
  variant?: "glass" | "reveal";
}) {
  const Component = as ?? "div";
  const nodeRef = useRef<HTMLElement | null>(null);
  const setRef = (node: HTMLElement | null) => {
    nodeRef.current = node;
  };

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const el = nodeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Component
      ref={setRef}
      onMouseMove={spotlight ? handleMouseMove : undefined}
      className={cn(
        variant === "glass" ? "glass" : "glass-reveal",
        "relative isolate overflow-hidden rounded-[1.75rem]",
        spotlight && "group/spot",
        className,
      )}
    >
      {spotlight ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-luxury group-hover/spot:opacity-100"
          style={{
            background:
              "radial-gradient(380px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(238, 223, 122, 0.14), transparent 62%)",
          }}
        />
      ) : null}
      {children}
    </Component>
  );
}
