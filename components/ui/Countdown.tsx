"use client";

import { useEffect, useState } from "react";

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    expired: diff <= 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/** Live day/hour/minute/second countdown to `endDate` — used on offer cards so urgency reads at a glance. */
export function Countdown({ endDate, className }: { endDate: string; className?: string }) {
  const target = new Date(endDate).getTime();
  const [parts, setParts] = useState(() => getParts(target));

  useEffect(() => {
    const timer = setInterval(() => setParts(getParts(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (parts.expired) return null;

  const cells = [
    { value: parts.days, label: "d" },
    { value: parts.hours, label: "h" },
    { value: parts.minutes, label: "m" },
    { value: parts.seconds, label: "s" },
  ];

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 tabular-nums">
        {cells.map((cell, index) => (
          <span key={cell.label} className="flex items-baseline gap-0.5">
            <span className="font-display text-base text-ivory">
              {String(cell.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase text-ivory/50">{cell.label}</span>
            {index < cells.length - 1 ? <span className="mx-0.5 text-ivory/30">:</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}
