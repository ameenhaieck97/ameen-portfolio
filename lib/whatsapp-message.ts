import { contact } from "@/data/contact";

/**
 * The WhatsApp CTA on any package (popup or the public Packages page) always
 * says the same thing — a locale-appropriate "I'm interested in the X
 * package" opener — so it never needs manual editing per package.
 */
export function buildPackageWhatsappLink(packageName: string, locale: "en" | "ar"): string {
  const message =
    locale === "ar"
      ? `مرحباً أمين،\nأنا مهتم بباقة ${packageName}.`
      : `Hello Ameen,\nI'm interested in the ${packageName} Package.`;
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
