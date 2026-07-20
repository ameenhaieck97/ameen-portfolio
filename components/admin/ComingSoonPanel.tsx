import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

/**
 * Placeholder for a website section that isn't backed by Supabase yet — the
 * public page renders it from static code/translation files today. Keeps
 * the sidebar's website-structured shape honest about what's actually
 * editable right now instead of shipping a broken/empty CRUD page.
 */
export function ComingSoonPanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass rounded-3xl p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <Icon size={24} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl text-ivory">{title}</h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-ivory/60">
          {description}
        </p>
      </div>
      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
    </div>
  );
}

export function ComingSoonLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="glass-reveal flex items-center justify-between gap-4 rounded-2xl border border-white/8 px-5 py-4 transition-colors hover:border-gold/25"
    >
      <div>
        <p className="text-sm font-medium text-ivory">{title}</p>
        <p className="mt-0.5 text-xs text-ivory/50">{description}</p>
      </div>
      <ArrowUpRight size={16} className="flex-none text-gold" aria-hidden />
    </Link>
  );
}
