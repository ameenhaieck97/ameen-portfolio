import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Ticker from "@/components/sections/Ticker";
import Portfolio from "@/components/sections/Portfolio";
import ExperienceImpact from "@/components/sections/ExperienceImpact";
import Education from "@/components/sections/Education";
import Clients from "@/components/sections/Clients";
import Contact from "@/components/sections/Contact";
import { getPortfolioItems } from "@/lib/portfolio-data";
import { getClients } from "@/lib/clients-data";
import { getCurrentWorkGalleries } from "@/lib/current-work-data";
import { getAboutPhotoUrl } from "@/lib/settings-data";

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

  const [portfolioItems, clients, currentWorkGalleries, aboutPhotoUrl] = await Promise.all([
    getPortfolioItems(),
    getClients(),
    getCurrentWorkGalleries(),
    getAboutPhotoUrl(),
  ]);

  return (
    <>
      <Hero />
      <About photoUrl={aboutPhotoUrl} />
      <Services />
      <Ticker />
      <Portfolio items={portfolioItems} />
      <ExperienceImpact currentWorkGalleries={currentWorkGalleries} />
      <Clients items={clients} />
      <Education />
      <Contact />
    </>
  );
}
