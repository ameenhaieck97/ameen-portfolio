import { cn } from "@/lib/cn";

/**
 * Deterministic generated artwork used until real project/partner assets are
 * dropped into /public/images. Driven by `seed` (not Math.random) so server
 * and client render identically.
 */
export function PlaceholderArt({
  seed = 0,
  label,
  monogram,
  className,
}: {
  seed?: number;
  label?: string;
  monogram?: string;
  className?: string;
}) {
  const angle = (seed * 47) % 360;
  const cx = 22 + ((seed * 31) % 56);
  const cy = 22 + ((seed * 53) % 56);
  const r = 20 + ((seed * 17) % 26);
  const gradId = `pg-${seed}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden={!label}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f3b3a" />
          <stop offset="100%" stopColor="#292726" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <g transform={`rotate(${angle} 50 50)`}>
        <line
          x1="-20"
          y1="100"
          x2="120"
          y2="0"
          stroke="#EEDF7A"
          strokeOpacity="0.14"
          strokeWidth="0.5"
        />
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#EEDF7A"
        strokeOpacity="0.32"
        strokeWidth="0.6"
      />
      <circle cx={cx} cy={cy} r="1.4" fill="#EEDF7A" fillOpacity="0.5" />
      {monogram ? (
        <text
          x="50"
          y="56"
          fontSize="15"
          textAnchor="middle"
          fill="#EEDF7A"
          fillOpacity="0.5"
          fontFamily="Georgia, serif"
        >
          {monogram}
        </text>
      ) : null}
      {label ? (
        <text
          x="8"
          y="93"
          fontSize="5.5"
          fill="#F6F3EC"
          fillOpacity="0.55"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.05em"
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}
