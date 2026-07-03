import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

const base =
  "group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-all duration-300 ease-out";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-canvas hover:bg-gold-soft hover:shadow-[0_0_36px_rgba(238,223,122,0.35)] active:scale-[0.98]",
  ghost:
    "glass text-ivory hover:border-gold/40 hover:text-gold active:scale-[0.98]",
};

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
};

type AnchorButtonProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

function Shine({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full",
        variant === "primary"
          ? "bg-gradient-to-r from-transparent via-white/45 to-transparent"
          : "bg-gradient-to-r from-transparent via-gold/15 to-transparent",
      )}
    />
  );
}

export function Button(props: AnchorButtonProps | NativeButtonProps) {
  const { children, variant = "primary", className, icon, ...rest } = props;
  const classes = cn(base, variants[variant], className);

  if (rest.href) {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} {...anchorProps}>
        <Shine variant={variant} />
        <span className="relative z-10 inline-flex items-center gap-2.5">
          {children}
          {icon}
        </span>
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      <Shine variant={variant} />
      <span className="relative z-10 inline-flex items-center gap-2.5">
        {children}
        {icon}
      </span>
    </button>
  );
}
