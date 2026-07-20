import { PanelBottom } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function FooterPage() {
  return (
    <ComingSoonPanel
      icon={PanelBottom}
      title="Footer"
      description="The footer's links and copy are still hardcoded in the site's code today. Editing them from here is planned for a future update."
    />
  );
}
