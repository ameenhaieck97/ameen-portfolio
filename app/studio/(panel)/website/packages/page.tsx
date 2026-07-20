import { Package } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function PackagesPage() {
  return (
    <ComingSoonPanel
      icon={Package}
      title="Packages"
      description="Manage pricing packages — title, price, features, and an expandable detail view with its own WhatsApp CTA. Coming in a future update."
    />
  );
}
