import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact } from "@/data/contact";
import {
  BehanceIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "@/components/ui/SocialIcons";

const socialIcons = {
  instagram: InstagramIcon,
  behance: BehanceIcon,
  linkedin: LinkedinIcon,
};

export default function Contact() {
  const t = useTranslations("contact");
  const whatsappHref = `https://wa.me/${contact.whatsappNumber}`;

  return (
    <section id="contact" className="relative py-32 sm:py-48">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <SectionHeading
          eyebrow={t("eyebrow")}
          heading={t("heading")}
          subheading={t("subheading")}
          align="center"
          index={7}
          size="display"
        />

        <RevealGroup
          stagger={0.08}
          delay={0.2}
          className="mt-14 flex flex-col items-center gap-5 sm:flex-row sm:justify-center"
        >
          <RevealItem>
            <Magnetic strength={0.25} className="inline-flex">
              <a
                href={`mailto:${contact.email}`}
                className="glass group flex items-center gap-4 rounded-full px-7 py-4 transition-all duration-500 ease-luxury hover:-translate-y-0.5 hover:border-gold/30"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Mail size={18} aria-hidden />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-ivory/50">
                    {t("emailLabel")}
                  </span>
                  <span className="block text-base font-medium text-ivory transition-colors group-hover:text-gold">
                    {contact.email}
                  </span>
                </span>
              </a>
            </Magnetic>
          </RevealItem>

          <RevealItem>
            <Magnetic strength={0.25} className="inline-flex">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="glass group flex items-center gap-4 rounded-full px-7 py-4 transition-all duration-500 ease-luxury hover:-translate-y-0.5 hover:border-gold/30"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold/15 text-gold">
                  <WhatsappIcon width={18} height={18} aria-hidden />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-ivory/50">
                    {t("whatsappLabel")}
                  </span>
                  <span className="block text-base font-medium text-ivory transition-colors group-hover:text-gold">
                    +{contact.whatsappNumber}
                  </span>
                </span>
              </a>
            </Magnetic>
          </RevealItem>
        </RevealGroup>

        <Reveal
          variant="fadeUp"
          delay={0.32}
          className="mt-14 flex items-center justify-center gap-3"
        >
          {contact.social.map(({ key, href }) => {
            const Icon = socialIcons[key as keyof typeof socialIcons];
            return (
              <Magnetic key={key} strength={0.35} className="inline-flex">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={key}
                  className="glass flex h-12 w-12 items-center justify-center rounded-full text-ivory/70 transition-all duration-500 ease-luxury hover:-translate-y-1 hover:scale-105 hover:text-gold hover:shadow-[0_0_24px_rgba(238,223,122,0.25)]"
                >
                  <Icon width={18} height={18} aria-hidden />
                </a>
              </Magnetic>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
