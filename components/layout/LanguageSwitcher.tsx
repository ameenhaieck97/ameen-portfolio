"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    // dir="ltr" is deliberate and independent of the page's own direction:
    // EN must always sit physically left and AR physically right, and a
    // plain flex row here would otherwise visually reverse on Arabic pages
    // (RTL flips row order), swapping them.
    <Link
      href={pathname}
      locale={nextLocale}
      dir="ltr"
      className={cn(
        "group glass inline-flex h-9 w-fit items-center rounded-full p-1 text-xs font-semibold uppercase tracking-wide",
        className,
      )}
      aria-label={`Switch to ${nextLocale === "ar" ? "Arabic" : "English"}`}
    >
      <span
        className={cn(
          "flex h-7 items-center justify-center rounded-full px-3 transition-colors",
          locale === "en" ? "bg-gold text-canvas" : "text-ivory/60 group-hover:text-gold",
        )}
      >
        EN
      </span>
      <span
        className={cn(
          "flex h-7 items-center justify-center rounded-full px-3 transition-colors",
          locale === "ar" ? "bg-gold text-canvas" : "text-ivory/60 group-hover:text-gold",
        )}
      >
        AR
      </span>
    </Link>
  );
}
