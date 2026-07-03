"use client";

import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/site";
import { contact } from "@/data/contact";
import {
  BehanceIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/ui/SocialIcons";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navKeys = ["about", "skills", "portfolio", "experience", "partners", "contact"] as const;

const socialIcons = {
  instagram: InstagramIcon,
  behance: BehanceIcon,
  linkedin: LinkedinIcon,
};

export default function Footer() {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const tMeta = useTranslations("meta");
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/8">
      <RevealGroup
        stagger={0.1}
        className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-start lg:justify-between lg:px-10"
      >
        <RevealItem variant="blurUp" className="max-w-sm">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <MonoLogo
              src={siteConfig.logo}
              label={tMeta("titleShort")}
              className="h-8 w-8"
            />
            <span className="font-display text-lg font-medium tracking-tight text-ivory">
              {tMeta("titleShort")}
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">
            {tf("tagline")}
          </p>
        </RevealItem>

        <RevealItem variant="fadeUp">
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {navKeys.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="text-sm font-medium text-ivory/70 transition-colors hover:text-gold"
              >
                {t(key)}
              </a>
            ))}
          </nav>
        </RevealItem>

        <RevealItem variant="fadeUp" className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            {contact.social.map(({ key, href }) => {
              const Icon = socialIcons[key as keyof typeof socialIcons];
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={key}
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-ivory/75 transition-colors hover:text-gold"
                >
                  <Icon width={17} height={17} />
                </a>
              );
            })}
          </div>
          <LanguageSwitcher />
        </RevealItem>
      </RevealGroup>

      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center justify-between gap-4 border-t border-white/8 px-6 py-6 text-xs text-ivory/45 sm:flex-row lg:px-10">
        <p>
          © {year} {tMeta("titleShort")}. {tf("rights")}
        </p>
        <a
          href="#hero"
          className="inline-flex items-center gap-1.5 text-ivory/60 transition-colors hover:text-gold"
        >
          {tf("backToTop")}
          <ArrowUp size={13} />
        </a>
      </div>
    </footer>
  );
}
