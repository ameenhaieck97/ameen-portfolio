import { Receipt } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function FinanceReceiptsPage() {
  return (
    <ComingSoonPanel
      icon={Receipt}
      title="Receipts"
      description="The global receipt ledger — Receipt Creator, PDF/PNG export, and this cross-client list ship in the next phase. For now, each client's own receipts are visible on their Client page under Financial Timeline."
    />
  );
}
