import { Mail } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MonoLogo } from "@/components/ui/MonoLogo";
import { siteConfig } from "@/data/site";
import { contact } from "@/data/contact";

export function MaintenancePage({
  eyebrow,
  title,
  description,
  contactPrefix,
}: {
  eyebrow: string;
  title: string;
  description: string;
  contactPrefix: string;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-24">
      <GlassCard className="w-full max-w-lg p-10 text-center sm:p-12" spotlight={false}>
        <MonoLogo src={siteConfig.logo} label={siteConfig.name} className="mx-auto h-10 w-10" />
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-ivory sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ivory/60">{description}</p>
        <a
          href={`mailto:${contact.email}`}
          className="mt-8 inline-flex items-center gap-2 text-sm text-ivory/70 transition-colors hover:text-gold"
        >
          <Mail size={15} aria-hidden />
          {contactPrefix} {contact.email}
        </a>
      </GlassCard>
    </div>
  );
}
