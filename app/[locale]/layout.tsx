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
      className={`${fontVars} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ivory">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <div className="grain" aria-hidden />
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
