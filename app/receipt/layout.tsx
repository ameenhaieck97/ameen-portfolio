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

// Loaded (not switched on by default — this page stays lang="en") so the
// bilingual "Back to statement" link's Arabic span, and any future Arabic
// content here, don't fall back to a system font.
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
      className={`${fraunces.variable} ${manrope.variable} ${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">{children}</body>
    </html>
  );
}
