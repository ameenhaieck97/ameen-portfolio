import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ar",
  localePrefix: "always",
  // Without this, next-intl still negotiates the visitor's Accept-Language
  // header on "/" and only falls back to defaultLocale when nothing
  // matches — meaning most browsers (set to en-*) would still land on
  // English. Disabling detection makes "/" always resolve to Arabic.
  localeDetection: false,
});
