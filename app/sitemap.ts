import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/data/site";
import { getOffersPageVisibility, getPackagesPageVisibility } from "@/lib/settings-data";

function pageEntries(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteConfig.url}/${locale}${path}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${siteConfig.url}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? (locale === routing.defaultLocale ? 1 : 0.9) : 0.7,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packagesVisible, offersVisible] = await Promise.all([
    getPackagesPageVisibility(),
    getOffersPageVisibility(),
  ]);

  return [
    ...pageEntries(""),
    ...(packagesVisible === "public" ? pageEntries("/packages") : []),
    ...(offersVisible === "public" ? pageEntries("/offers") : []),
  ];
}
