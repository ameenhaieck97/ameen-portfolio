import type { Metadata } from "next";
import localFont from "next/font/local";
import { ToastProvider } from "@/components/admin/Toast";
import "../[locale]/globals.css";

// One typeface sitewide, both languages — ITF Qomra Arabic covers Latin
// glyphs fully, so English no longer needs a separate font (Fraunces/
// Manrope). Kept under the "--font-rayat-ar" variable name/folder history —
// see fonts/rayat-ar/ for the previous Arabic-only font this replaced.
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
      className={`${rayatAr.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
