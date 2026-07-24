// Shared currency formatting for the Financial Studio. Western numerals on
// purpose in both locales — the site already renders Arabic stats that way
// (e.g. ticker's "+500 مشروع"), so money follows the same convention rather
// than switching to Arabic-Indic digits.

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  numberingSystem: "latn",
});

const iqdFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  numberingSystem: "latn",
  maximumFractionDigits: 0,
});

// Postgres numeric/decimal columns come back from Supabase/PostgREST as
// strings (avoids float precision loss over the wire) even though the
// TypeScript types declare them as number — accept both here so display
// never breaks regardless of which shape actually arrives.
export function formatUSD(amount: number | string) {
  return usdFormatter.format(Number(amount));
}

export function formatIQD(amount: number | string) {
  return `${iqdFormatter.format(Number(amount))} IQD`;
}

export function formatDate(isoDate: string, locale: "en" | "ar") {
  return new Date(isoDate).toLocaleDateString(locale === "ar" ? "ar" : "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
  });
}
