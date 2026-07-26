"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatUSD } from "@/lib/format";
import type { PublicClientStatement } from "@/types/finance";

const STRINGS = {
  ar: {
    brand: "أمين الحايك — مصمم جرافيك",
    eyebrow: "كشف حساب العميل",
    totalDue: "المبلغ الواجب دفعه",
    lastPayment: "تاريخ آخر دفعة",
    receipts: (count: number) => `الفواتير (${count})`,
    noReceipts: "لا توجد فواتير حتى الآن.",
    receiptLabel: "فاتورة",
    paid: "مدفوعة",
    unpaid: "غير مدفوعة",
    dash: "—",
  },
  en: {
    brand: "Ameen Haieck — Graphic Designer",
    eyebrow: "Client Statement",
    totalDue: "Total due",
    lastPayment: "Last payment",
    receipts: (count: number) => `Receipts (${count})`,
    noReceipts: "No receipts yet.",
    receiptLabel: "Receipt",
    paid: "Paid",
    unpaid: "Unpaid",
    dash: "—",
  },
} as const;

export function ClientStatementView({ statement }: { statement: PublicClientStatement }) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const clientName = lang === "ar" && statement.client_name_ar ? statement.client_name_ar : statement.client_name;

  // globals.css keys --display-font-family/--body-font-family off
  // html[lang="ar"] — the layout sets that by default, but toggling the
  // in-page language needs to flip the real <html> attribute too, or every
  // element keeps using the Arabic font (or vice versa) after a switch.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <main dir={dir} className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-xl py-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">{t.brand}</p>
          <div className="glass inline-flex flex-none items-center rounded-full p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={
                lang === "ar"
                  ? "rounded-full bg-gold px-3 py-1 text-canvas"
                  : "rounded-full px-3 py-1 text-ivory/60 transition-colors hover:text-ivory"
              }
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={
                lang === "en"
                  ? "rounded-full bg-gold px-3 py-1 text-canvas"
                  : "rounded-full px-3 py-1 text-ivory/60 transition-colors hover:text-ivory"
              }
            >
              EN
            </button>
          </div>
        </div>

        <div className="glass space-y-6 rounded-3xl p-6 sm:p-8">
          <div className="border-b border-white/8 pb-5">
            <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">{t.eyebrow}</p>
            <p className="mt-1 font-display text-2xl text-ivory">{clientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-canvas p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">{t.totalDue}</p>
              <p className="mt-1 font-display text-2xl text-gold">{formatUSD(statement.total_due)}</p>
            </div>
            <div className="rounded-2xl bg-canvas p-5">
              <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">{t.lastPayment}</p>
              <p className="mt-1 font-display text-2xl text-ivory">
                {statement.last_payment_date ? formatDate(statement.last_payment_date, lang) : t.dash}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.1em] text-ivory/40">
              {t.receipts(statement.receipts.length)}
            </p>
            {statement.receipts.length === 0 ? (
              <div className="rounded-2xl border border-white/8 py-8 text-center text-sm text-ivory/50">
                {t.noReceipts}
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
                        {t.receiptLabel} #{String(receipt.receipt_number).padStart(4, "0")}
                      </p>
                      <p className="mt-0.5 text-xs text-ivory/45">
                        {formatDate(receipt.receipt_date, lang)}
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
                        {receipt.is_paid ? t.paid : t.unpaid}
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
