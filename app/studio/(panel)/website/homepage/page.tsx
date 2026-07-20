import { Home } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function HomepagePage() {
  return (
    <ComingSoonPanel
      icon={Home}
      title="Homepage"
      description="The hero, ticker, and impact sections are still hardcoded in the site's code today. Editing them from here is planned for a future update."
    />
  );
}
