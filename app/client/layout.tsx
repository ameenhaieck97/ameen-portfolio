import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">{children}</body>
    </html>
  );
}
