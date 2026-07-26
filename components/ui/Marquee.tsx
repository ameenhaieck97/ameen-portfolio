"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { cn } from "@/lib/cn";

const AUTO_SCROLL_SECONDS = 42;

export function Marquee({
  children,
  className,
  pauseOnHover = true,
  copies = 6,
  /**
   * Lets the visitor grab the track and drag it left/right instead of only
   * auto-scrolling — the auto-scroll never pauses on hover in this mode
   * (dragging is the only way to take control), unlike the CSS-driven path
   * below which optionally pauses on hover.
   */
  draggable = false,
}: {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  /**
   * Number of times the content is duplicated back-to-back inside the
   * scrolling track. Must be high enough that `copies` repetitions of the
   * content are always wider than the widest realistic viewport, otherwise
   * a gap becomes visible once the track has scrolled past the first copy.
   */
  copies?: number;
  draggable?: boolean;
}) {
  const trackStyle = { "--marquee-copies": copies } as CSSProperties;

  if (draggable) {
    return (
      <DraggableMarquee className={className} copies={copies}>
        {children}
      </DraggableMarquee>
    );
  }

  return (
    <div
      dir="ltr"
      className={cn(
        "group relative -my-6 w-full max-w-full overflow-hidden py-6",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <div
        style={trackStyle}
        className={cn(
          "marquee-track flex w-max shrink-0 items-stretch gap-6 animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            className="flex shrink-0 items-stretch gap-6"
            aria-hidden={i > 0}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Same seamless-loop illusion as the CSS track above (content tiled `copies`
 * times, looping by exactly one copy-width), but driven by a Framer Motion
 * value instead of a CSS keyframe — a MotionValue is what `drag="x"` needs
 * to hand control to the pointer and back without the two fighting over the
 * same `transform`. Auto-scroll resumes from wherever the drag released it.
 */
function DraggableMarquee({
  children,
  className,
  copies,
}: {
  children: ReactNode;
  className?: string;
  copies: number;
}) {
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const x = useMotionValue(0);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const el = firstCopyRef.current;
    if (!el) return;
    const measure = () => setCopyWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const runLoop = (from: number) => {
    controls.current?.stop();
    if (copyWidth <= 0) return;
    // Normalize into a single copy-width so a long drag session never
    // drifts the loop's starting point outside the tiled content.
    const start = from % copyWidth;
    x.set(start);
    // Always a full copy-width per lap at the same constant speed —
    // duration stays fixed regardless of where a drag released it.
    controls.current = animate(x, start - copyWidth, {
      duration: AUTO_SCROLL_SECONDS,
      ease: "linear",
      onComplete: () => runLoop(0),
    });
  };

  useEffect(() => {
    if (copyWidth > 0) runLoop(0);
    return () => controls.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyWidth]);

  const dragBound = copyWidth > 0 ? copyWidth * (copies - 1) : 0;

  return (
    <div
      dir="ltr"
      className={cn(
        "relative -my-6 w-full max-w-full overflow-hidden py-6",
        "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -dragBound, right: dragBound }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ x }}
        onPointerDown={() => controls.current?.stop()}
        onDragEnd={() => runLoop(x.get())}
        className="flex w-max shrink-0 cursor-grab items-stretch gap-6 active:cursor-grabbing"
      >
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstCopyRef : undefined}
            className="flex shrink-0 items-stretch gap-6"
            aria-hidden={i > 0}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
