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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Ticker />
      <Portfolio />
      <ExperienceImpact />
      <Certifications />
      <Partners />
      <Contact />
    </>
  );
}
