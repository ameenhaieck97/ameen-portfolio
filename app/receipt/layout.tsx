import type { Metadata } from "next";
import localFont from "next/font/local";
import "../[locale]/globals.css";

// One typeface for the whole page — ITF Qomra Arabic covers Latin glyphs
// fully, so it also renders the bilingual "Back to statement" link's
// Arabic span and any future Arabic content here without a separate font.
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
  title: "Receipt",
  robots: { index: false, follow: false },
};

/**
 * Its own root layout — this route sits outside both app/[locale] (public
 * site) and app/studio (admin, session-gated), so per Next.js App Router
 * rules it needs its own <html>/<body>, same as app/studio/layout.tsx does.
 */
export default function ReceiptLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">{children}</body>
    </html>
  );
}
