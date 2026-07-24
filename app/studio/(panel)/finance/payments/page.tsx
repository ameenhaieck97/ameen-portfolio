import { Wallet } from "lucide-react";
import { ComingSoonPanel } from "@/components/admin/ComingSoonPanel";

export default function FinancePaymentsPage() {
  return (
    <ComingSoonPanel
      icon={Wallet}
      title="Payments"
      description="The cross-client payment ledger ships alongside the Receipt Creator in the next phase — payments are recorded as part of creating a receipt."
    />
  );
}
