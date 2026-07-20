import { Mail } from "lucide-react";
import { ComingSoonLinkCard, ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function ContactPage() {
  return (
    <ComingSoonPanel
      icon={Mail}
      title="Contact"
      description="The Contact section's copy is still hardcoded in the site's code today. Your contact details for internal use (e.g. a future WhatsApp button) live in Settings."
    >
      <ComingSoonLinkCard
        href="/studio/settings"
        title="Settings"
        description="Site title, contact email, phone, location, and social links."
      />
    </ComingSoonPanel>
  );
}
