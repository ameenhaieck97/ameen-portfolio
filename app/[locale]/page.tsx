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

// The studio calls the revalidatePublicSite Server Action right after every
// save, so this is only a safety net in case that call is ever missed —
// pages still stay static (and fast) between edits, refreshed on-demand
// rather than on a timer.
export const revalidate = 86400;

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
