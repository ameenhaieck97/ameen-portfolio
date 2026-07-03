import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  as,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const Component = as ?? "div";
  return (
    <Component className={cn("glass rounded-[1.75rem]", className)}>
      {children}
    </Component>
  );
}
