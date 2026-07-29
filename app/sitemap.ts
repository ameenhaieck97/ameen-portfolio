import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/data/site";
import { getPackagesPageVisibility } from "@/lib/settings-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteConfig.url}/${locale}`]),
  );

  const homeEntries: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${siteConfig.url}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));

  const packagesVisible = (await getPackagesPageVisibility()) === "public";
  if (!packagesVisible) return homeEntries;

  const packagesLanguages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteConfig.url}/${locale}/packages`]),
  );
  const packagesEntries: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${siteConfig.url}/${locale}/packages`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: { languages: packagesLanguages },
  }));

  return [...homeEntries, ...packagesEntries];
}
