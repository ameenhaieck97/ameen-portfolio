import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { getServerReadClient } from "@/lib/supabase/server-read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ReceiptView } from "@/components/finance/ReceiptView";
import type { PublicReceipt } from "@/types/finance";

// Token-secured, per-receipt financial document — never indexable, even
// though the route itself stays reachable to anyone holding the link.
export const metadata: Metadata = {
  title: "Receipt — Ameen Haieck",
  robots: { index: false, follow: false },
};

async function getPublicReceipt(token: string): Promise<PublicReceipt | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase.rpc("get_public_receipt", { p_token: token });
    if (error || !data) return null;
    return data as PublicReceipt;
  } catch {
    return null;
  }
}

export default async function PublicReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const receipt = await getPublicReceipt(token);

  if (!receipt) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="font-display text-xl text-ivory">Receipt not found</p>
          <p className="mt-2 text-sm text-ivory/55">
            This link may be incorrect or the receipt may have been removed.
          </p>
        </div>
      </main>
    );
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const publicUrl = `${protocol}://${host}/receipt/${token}`;
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 160 });

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href={`/client/${receipt.client_portal_token}`}
            className="glass inline-flex flex-none items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-ivory/80 transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} aria-hidden />
            <span dir="rtl" style={{ fontFamily: "var(--font-rayat-ar), Tahoma, sans-serif" }}>
              رجوع لكشف الحساب
            </span>
            <span aria-hidden>·</span>
            <span>Back to statement</span>
          </Link>
        </div>
        <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-gold">
          Ameen Haieck — Graphic Designer
        </p>
        <div className="glass rounded-3xl p-2">
          <ReceiptView
            receiptNumber={receipt.receipt_number}
            receiptDate={receipt.receipt_date}
            clientName={receipt.client_name}
            projectName={receipt.project_name}
            items={receipt.items}
            subtotal={receipt.subtotal}
            discount={receipt.discount}
            previousBalance={receipt.previous_balance}
            amountPaid={receipt.amount_paid}
            remainingBalance={receipt.remaining_balance}
            exchangeRate={receipt.exchange_rate}
            finalTotalIqd={receipt.final_total_iqd}
            notes={receipt.notes}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    </main>
  );
}
