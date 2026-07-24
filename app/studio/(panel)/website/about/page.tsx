import { UserCircle } from "lucide-react";
import { ComingSoonLinkCard, ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function AboutPage() {
  return (
    <ComingSoonPanel
      icon={UserCircle}
      title="About"
      description="The About section's narrative copy is still hardcoded in the site's code today. What you can already manage — Skills, Experience, and Testimonials — lives here for now."
    >
      <ComingSoonLinkCard
        href="/studio/skills"
        title="Skills"
        description="The list of skills shown on the site."
      />
      <ComingSoonLinkCard
        href="/studio/experience"
        title="Experience"
        description="Career timeline entries — company, role, years, description."
      />
      <ComingSoonLinkCard
        href="/studio/testimonials"
        title="Testimonials"
        description="Client quotes and reviews — not yet shown anywhere on the public site."
      />
    </ComingSoonPanel>
  );
}
