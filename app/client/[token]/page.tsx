import Link from "next/link";
import { getServerReadClient } from "@/lib/supabase/server-read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, formatUSD } from "@/lib/format";
import type { PublicClientStatement } from "@/types/finance";

async function getPublicClientStatement(token: string): Promise<PublicClientStatement | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase.rpc("get_public_client_statement", { p_token: token });
    if (error || !data) return null;
    return data as PublicClientStatement;
  } catch {
    return null;
  }
}

export default async function PublicClientStatementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const statement = await getPublicClientStatement(token);

  if (!statement) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="font-display text-xl text-ivory">Statement not found</p>
          <p className="mt-2 text-sm text-ivory/55">
            This link may be incorrect or the account may have been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-xl py-10">
        <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-gold">
          Ameen Haieck — Graphic Designer
        </p>
        <div className="glass space-y-6 rounded-3xl p-6 sm:p-8">
          <div className="border-b border-white/8 pb-5">
            <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Client Statement</p>
            <p className="mt-1 font-display text-2xl text-ivory">{statement.client_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-canvas p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Total due</p>
              <p className="mt-1 font-display text-2xl text-gold">{formatUSD(statement.total_due)}</p>
            </div>
            <div className="rounded-2xl bg-canvas p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Last payment</p>
              <p className="mt-1 font-display text-2xl text-ivory">
                {statement.last_payment_date ? formatDate(statement.last_payment_date, "en") : "—"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.1em] text-ivory/40">
              Receipts ({statement.receipts.length})
            </p>
            {statement.receipts.length === 0 ? (
              <div className="rounded-2xl border border-white/8 py-8 text-center text-sm text-ivory/50">
                No receipts yet.
              </div>
            ) : (
              <div className="space-y-2">
                {statement.receipts.map((receipt) => (
                  <Link
                    key={receipt.id}
                    href={`/receipt/${receipt.share_token}`}
                    className="glass-reveal flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-4 py-3.5 transition-colors hover:border-gold/25"
                  >
                    <div>
                      <p className="text-sm font-medium text-ivory">
                        Receipt #{String(receipt.receipt_number).padStart(4, "0")}
                      </p>
                      <p className="mt-0.5 text-xs text-ivory/45">
                        {formatDate(receipt.receipt_date, "en")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-ivory">
                        {formatUSD(receipt.final_total_usd)}
                      </p>
                      <span
                        className={
                          receipt.is_paid
                            ? "inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-emerald-300"
                            : "inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ivory/60"
                        }
                      >
                        {receipt.is_paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
