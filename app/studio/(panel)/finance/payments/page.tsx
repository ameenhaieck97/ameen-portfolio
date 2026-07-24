"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";
import { formatDate, formatUSD } from "@/lib/format";
import type { FinancePayment } from "@/types/finance";

type PaymentRow = FinancePayment & {
  finance_projects: {
    name: string;
    client_id: string;
    finance_clients: { name: string } | null;
  } | null;
};

export default function FinancePaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabaseClient()
        .from("finance_payments")
        .select("*, finance_projects(name, client_id, finance_clients(name))")
        .order("paid_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        toast(error.message, "error");
        return;
      }
      setPayments((data ?? []) as unknown as PaymentRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ivory">Payments</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        {payments ? `${payments.length} total` : "Loading…"} — every payment recorded across all
        clients, most recent first.
      </p>

      <div className="mt-6">
        {!payments ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="glass rounded-3xl p-14 text-center text-sm text-ivory/55">
            No payments recorded yet — payments are created as part of the Receipt Creator.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="glass-reveal flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 px-5 py-4"
              >
                <div>
                  {payment.finance_projects?.client_id ? (
                    <Link
                      href={`/studio/finance/clients/${payment.finance_projects.client_id}`}
                      className="font-display text-base text-ivory transition-colors hover:text-gold"
                    >
                      {payment.finance_projects.finance_clients?.name ?? "Unknown client"}
                    </Link>
                  ) : (
                    <p className="font-display text-base text-ivory">Unknown client</p>
                  )}
                  <p className="mt-0.5 text-xs text-ivory/45">
                    {formatDate(payment.paid_at, "en")}
                    {payment.finance_projects?.name ? ` · ${payment.finance_projects.name}` : ""}
                  </p>
                </div>
                <p className="font-display text-lg text-gold">{formatUSD(payment.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
