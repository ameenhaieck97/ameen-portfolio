import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { PackageCard } from "@/components/packages/PackageCard";
import { SectionLink } from "@/components/layout/SectionLink";
import { getPublishedPackages } from "@/lib/packages-data";
import { getPackagesPageVisibility } from "@/lib/settings-data";

export const revalidate = 86400;

type PageParams = { locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, visibility] = await Promise.all([
    getTranslations({ locale, namespace: "packagesPage" }),
    getPackagesPageVisibility(),
  ]);

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/packages`,
      languages: { en: "/en/packages", ar: "/ar/packages" },
    },
    // Hidden means "shareable by direct link only" — the page itself stays
    // reachable, it just shouldn't surface in search results while private.
    robots: visibility === "hidden" ? { index: false, follow: false } : undefined,
    // openGraph/twitter don't deep-merge with the layout's — once a page sets
    // its own openGraph object, the layout's opengraph-image file convention
    // no longer auto-attaches, so the image is repeated here explicitly.
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}/packages`,
      images: [`/${locale}/opengraph-image`],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`/${locale}/opengraph-image`],
    },
  };
}

export default async function PackagesPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, packages] = await Promise.all([
    getTranslations("packagesPage"),
    getPublishedPackages(),
  ]);

  return (
    <section className="relative py-28 sm:py-36 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("title")}
          subheading={t("description")}
          align="center"
        />

        {packages.length === 0 ? (
          <Reveal variant="fadeUp" className="mt-14 sm:mt-20">
            <GlassCard
              variant="glass"
              className="mx-auto flex max-w-xl flex-col items-center gap-5 p-10 text-center sm:p-14"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <PackageSearch size={24} aria-hidden />
              </span>
              <div>
                <p className="font-display text-2xl text-ivory">{t("emptyTitle")}</p>
                <p className="text-pretty mt-3 text-sm leading-relaxed text-ivory/65">{t("emptyDescription")}</p>
              </div>
              <SectionLink
                hash="contact"
                className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-canvas transition-all duration-500 ease-luxury hover:-translate-y-0.5 hover:bg-gold-soft hover:shadow-[0_0_28px_rgba(238,223,122,0.3)]"
              >
                {t("emptyCta")}
              </SectionLink>
            </GlassCard>
          </Reveal>
        ) : (
          <RevealGroup
            stagger={0.08}
            className="mt-14 grid grid-cols-1 gap-5 sm:mt-20 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
          >
            {packages.map((pkg) => (
              <RevealItem key={pkg.id} variant="liftScale" className="h-full">
                <PackageCard pkg={pkg} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </section>
  );
}
