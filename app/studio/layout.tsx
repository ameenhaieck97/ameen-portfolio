import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { ToastProvider } from "@/components/admin/Toast";
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

// Loaded so Arabic-script content the admin types/views (receipt service
// names, client names, notes_ar) renders in the site's real Arabic font via
// globals.css's per-glyph fallback, instead of a system default — same
// reasoning as app/receipt/layout.tsx and app/client/layout.tsx.
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
  title: "Admin — Ameen Haieck",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      // Browser extensions (e.g. LanguageTool) stamp extra attributes onto
      // <html> before React hydrates; suppress attribute-mismatch warnings
      // for this element only — one level deep, children still validated.
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
