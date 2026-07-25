import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/data/site";
import { contact } from "@/data/contact";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SiteBackground } from "@/components/layout/SiteBackground";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: `%s · ${t("titleShort")}`,
    },
    description: t("description"),
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: t("titleShort"),
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontVars =
    locale === "ar"
      ? rayatAr.variable
      : `${fraunces.variable} ${manrope.variable}`;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: tMeta("titleShort"),
    jobTitle: "Graphic Designer",
    url: `${siteConfig.url}/${locale}`,
    email: contact.email,
    knowsAbout: [
      "Brand Identity",
      "Arabic Typography",
      "Visual Communication",
      "Social Media Design",
    ],
  };

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      // Browser extensions (e.g. LanguageTool) stamp extra attributes onto
      // <html> before React hydrates; suppress attribute-mismatch warnings
      // for this element only — one level deep, children still validated.
      suppressHydrationWarning
      className={`${fontVars} h-full overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-full w-full flex-col overflow-x-hidden bg-canvas text-ivory">
        {/* EXPERIMENTAL (Liquid Glass prototype) — hidden SVG filter referenced by
            .glass/.glass-strong's backdrop-filter to genuinely refract/displace
            whatever renders behind the glass (not just blur it), matching Apple's
            Liquid Glass. Revert: remove this block + app/studio/layout.tsx's
            copy + the CSS/component changes noted in globals.css's own comment. */}
        <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          {/* Region kept tight to the element's own bounds (was -20%/140%) —
              a larger region let the filter sample and drag in background
              pixels from well outside the glass surface, which read as "the
              wrong background" bleeding through the edges. scale lowered
              (was 60) so the ripple stays a subtle local wobble instead of a
              strong pull. */}
          <filter id="liquid-glass-distortion" x="-2%" y="-2%" width="104%" height="104%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.014" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
            <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        {/* Raw <style> tag — deliberately NOT in globals.css. Next's CSS
            pipeline (Lightning CSS) strips the entire backdrop-filter
            property when a url(#...) value is present, even as a second
            fallback declaration; a literal <style> element in the page
            bypasses that pipeline and reaches the browser unmodified. */}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <div className="grain" aria-hidden />
        <SiteBackground />
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="skip-link">
            {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CustomCursor />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
