import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { PackageCard } from "@/components/packages/PackageCard";
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
    alternates: { canonical: `/${locale}/packages` },
    // Hidden means "shareable by direct link only" — the page itself stays
    // reachable, it just shouldn't surface in search results while private.
    robots: visibility === "hidden" ? { index: false, follow: false } : undefined,
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
          <p className="mt-16 text-center text-sm text-ivory/55">{t("empty")}</p>
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
