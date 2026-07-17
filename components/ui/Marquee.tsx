import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Marquee({
  children,
  className,
  pauseOnHover = true,
  copies = 6,
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
}) {
  const trackStyle = { "--marquee-copies": copies } as CSSProperties;

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
