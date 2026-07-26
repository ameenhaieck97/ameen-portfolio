import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "../[locale]/globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Same Arabic font as the public site (app/[locale]/layout.tsx) — this
// page's language toggle switches html[lang], and globals.css keys the
// --display-font-family/--body-font-family CSS variables off that
// attribute, so loading the font here is the only piece needed for every
// element on the page to pick up the right family automatically.
const rayatAr = localFont({
  variable: "--font-rayat-ar",
  display: "swap",
  src: [
    { path: "../../fonts/rayat-ar/ITFRayatAr-Light.otf", weight: "300", style: "normal" },
    { path: "../../fonts/rayat-ar/ITFRayatAr-Regular.otf", weight: "400", style: "normal" },
    { path: "../../fonts/rayat-ar/ITFRayatAr-Medium.otf", weight: "500", style: "normal" },
    { path: "../../fonts/rayat-ar/ITFRayatAr-Bold.otf", weight: "700", style: "normal" },
    { path: "../../fonts/rayat-ar/ITFRayatAr-Black.otf", weight: "900", style: "normal" },
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
      className={`${fraunces.variable} ${manrope.variable} ${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">{children}</body>
    </html>
  );
}
