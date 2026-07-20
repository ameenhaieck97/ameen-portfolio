import { Percent } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function OffersPage() {
  return (
    <ComingSoonPanel
      icon={Percent}
      title="Offers"
      description="Manage limited-time offers with a discount, start/end dates, and automatic expiry. Coming in a future update."
    />
  );
}
