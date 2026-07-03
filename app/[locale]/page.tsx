import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/sections/Ticker";
import About from "@/components/sections/About";
import CurrentWork from "@/components/sections/CurrentWork";
import Skills from "@/components/sections/Skills";
import Portfolio from "@/components/sections/Portfolio";
import Stats from "@/components/sections/Stats";
import Experience from "@/components/sections/Experience";
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
      <Ticker />
      <About />
      <CurrentWork />
      <Skills />
      <Portfolio />
      <Stats />
      <Experience />
      <Certifications />
      <Partners />
      <Contact />
    </>
  );
}
