import type { Metadata } from "next";
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
import { getPackagesPageVisibility, getSectionTextScales } from "@/lib/settings-data";
import "./globals.css";

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
  const packagesVisible = (await getPackagesPageVisibility()) === "public";
  const textScales = await getSectionTextScales();
  const dir = locale === "ar" ? "rtl" : "ltr";

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
      className={`${rayatAr.variable} h-full overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-full w-full flex-col overflow-x-hidden bg-canvas text-ivory">
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
          <Header packagesVisible={packagesVisible} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer packagesVisible={packagesVisible} textScale={textScales.footer} />
          <CustomCursor />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
