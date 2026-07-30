import type { Metadata } from "next";
import localFont from "next/font/local";
import "../[locale]/globals.css";

// Same typeface as the public site (app/[locale]/layout.tsx) — ITF Qomra
// Arabic covers Latin glyphs fully, so it's the only font loaded, for both
// languages this page's toggle switches html[lang] between.
const rayatAr = localFont({
  variable: "--font-rayat-ar",
  display: "swap",
  src: [
    { path: "../../fonts/itf-qomra-arabic/ITFQomraArabic-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/itf-qomra-arabic/ITFQomraArabic-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/itf-qomra-arabic/ITFQomraArabic-Medium.otf", weight: "500", style: "normal" },
    { path: "../../fonts/itf-qomra-arabic/ITFQomraArabic-Bold.otf", weight: "700", style: "normal" },
    { path: "../../fonts/itf-qomra-arabic/ITFQomraArabic-Black.otf", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Client Statement",
  robots: { index: false, follow: false },
};

/**
 * Its own root layout — this route sits outside both app/[locale] (public
 * site) and app/studio (admin, session-gated), same reasoning as
 * app/receipt/layout.tsx.
 */
export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">{children}</body>
    </html>
  );
}
