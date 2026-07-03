"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className={cn(
        "glass flex h-10 items-center gap-1 rounded-full px-1 text-xs font-semibold uppercase tracking-wide",
        className,
      )}
      aria-label={`Switch to ${nextLocale === "ar" ? "Arabic" : "English"}`}
    >
      <span
        className={cn(
          "rounded-full px-2.5 py-1.5 transition-colors",
          locale === "en" ? "bg-gold text-canvas" : "text-ivory/60",
        )}
      >
        EN
      </span>
      <span
        className={cn(
          "rounded-full px-2.5 py-1.5 transition-colors",
          locale === "ar" ? "bg-gold text-canvas" : "text-ivory/60",
        )}
      >
        AR
      </span>
    </button>
  );
}
