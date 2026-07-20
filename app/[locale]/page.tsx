import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Ticker from "@/components/sections/Ticker";
import Portfolio from "@/components/sections/Portfolio";
import ExperienceImpact from "@/components/sections/ExperienceImpact";
import Certifications from "@/components/sections/Certifications";
import Partners from "@/components/sections/Partners";
import Contact from "@/components/sections/Contact";
import { getPortfolioItems } from "@/lib/portfolio-data";

// Revalidate hourly so CMS edits appear without a redeploy, while pages stay
// statically served for speed.
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const portfolioItems = await getPortfolioItems();

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Ticker />
      <Portfolio items={portfolioItems} />
      <ExperienceImpact />
      <Certifications />
      <Partners />
      <Contact />
    </>
  );
}
