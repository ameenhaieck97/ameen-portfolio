import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
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
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ivory">
        {/* EXPERIMENTAL (Liquid Glass prototype) — see app/[locale]/layout.tsx for details. */}
        <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          <filter id="liquid-glass-distortion" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.014" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {/* Raw <style> tag — see app/[locale]/layout.tsx for why this can't live in globals.css. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @supports (backdrop-filter: blur(1px)) {
                .glass, .glass-strong {
                  backdrop-filter: url(#liquid-glass-distortion) blur(6px) saturate(200%) contrast(1.1) brightness(1.08);
                }
              }
            `,
          }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
