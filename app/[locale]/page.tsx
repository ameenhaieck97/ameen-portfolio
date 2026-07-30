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
import { getAboutPhotoUrl, getSectionTextScales } from "@/lib/settings-data";
import { getPromoPopup } from "@/lib/promo-data";
import { PromoPopup } from "@/components/ui/PromoPopup";

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

  const [portfolioItems, clients, currentWorkGalleries, aboutPhotoUrl, promo, textScales] =
    await Promise.all([
      getPortfolioItems(),
      getClients(),
      getCurrentWorkGalleries(),
      getAboutPhotoUrl(),
      getPromoPopup(),
      getSectionTextScales(),
    ]);

  return (
    <>
      {promo ? <PromoPopup payload={promo} /> : null}
      <Hero textScale={textScales.hero} />
      <About photoUrl={aboutPhotoUrl} textScale={textScales.about} />
      <Services textScale={textScales.services} />
      <Ticker />
      <Portfolio items={portfolioItems} textScale={textScales.portfolio} />
      <ExperienceImpact
        currentWorkGalleries={currentWorkGalleries}
        textScale={textScales.experience}
      />
      <Clients items={clients} textScale={textScales.clients} />
      <Education textScale={textScales.education} />
      <Contact textScale={textScales.contact} />
    </>
  );
}
