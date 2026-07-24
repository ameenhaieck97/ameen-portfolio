"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileImage, Loader2 } from "lucide-react";
import { GlassDrawer } from "@/components/admin/GlassDrawer";
import { useToast } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { exportNodeAsPdf, exportNodeAsPng } from "@/lib/finance/export";
import { formatDate, formatIQD, formatUSD } from "@/lib/format";
import type { FinanceReceipt, FinanceReceiptWithItems } from "@/types/finance";

export function ReceiptDrawer({
  receipts,
  openId,
  onClose,
  onNavigate,
  clientName,
  projectNameById,
}: {
  /** Newest-first, exactly as shown in the Financial Timeline — drives Previous/Next. */
  receipts: FinanceReceipt[];
  openId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  clientName: string;
  projectNameById: Map<string, string>;
}) {
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<FinanceReceiptWithItems | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Clear the previous receipt's content the instant the target id changes,
  // computed directly during render, so stale content never flashes while
  // the new one loads.
  const [prevOpenId, setPrevOpenId] = useState(openId);
  if (openId !== prevOpenId) {
    setPrevOpenId(openId);
    setReceipt(null);
  }

  useEffect(() => {
    if (!openId) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabaseClient()
        .from("finance_receipts")
        .select("*, finance_receipt_items(*)")
        .eq("id", openId)
        .order("sort_order", { referencedTable: "finance_receipt_items", ascending: true })
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast(error?.message ?? "Could not load this receipt.", "error");
        return;
      }
      setReceipt(data as FinanceReceiptWithItems);
    })();
    return () => {
      cancelled = true;
    };
  }, [openId, toast]);

  const currentIndex = openId ? receipts.findIndex((item) => item.id === openId) : -1;
  const previousReceipt = currentIndex >= 0 ? receipts[currentIndex + 1] : undefined;
  const nextReceipt = currentIndex > 0 ? receipts[currentIndex - 1] : undefined;

  const runExport = async (kind: "pdf" | "png") => {
    if (!contentRef.current || !receipt) return;
    setExporting(kind);
    try {
      const filename = `receipt-${String(receipt.receipt_number).padStart(4, "0")}.${kind}`;
      if (kind === "png") {
        await exportNodeAsPng(contentRef.current, filename);
      } else {
        await exportNodeAsPdf(contentRef.current, filename);
      }
    } catch {
      toast("Export failed — please try again.", "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <GlassDrawer
      open={openId !== null}
      onClose={onClose}
      title={receipt ? `Receipt #${String(receipt.receipt_number).padStart(4, "0")}` : "Receipt"}
      headerExtra={
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous receipt"
            disabled={!previousReceipt}
            onClick={() => previousReceipt && onNavigate(previousReceipt.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next receipt"
            disabled={!nextReceipt}
            onClick={() => nextReceipt && onNavigate(nextReceipt.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      }
    >
      {!receipt ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 size={20} className="animate-spin text-ivory/40" aria-hidden />
        </div>
      ) : (
        <div className="space-y-6">
          <div ref={contentRef} className="space-y-6 rounded-2xl bg-canvas p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <p className="font-display text-2xl text-ivory">
                  Receipt #{String(receipt.receipt_number).padStart(4, "0")}
                </p>
                <p className="mt-1 text-sm text-ivory/55">{formatDate(receipt.receipt_date, "en")}</p>
              </div>
              <div className="text-end">
                <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Client</p>
                <p className="mt-0.5 text-sm font-medium text-ivory">{clientName}</p>
                {projectNameById.get(receipt.project_id) ? (
                  <p className="text-xs text-ivory/45">{projectNameById.get(receipt.project_id)}</p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-ivory/50">Items</p>
              {receipt.finance_receipt_items.length === 0 ? (
                <p className="rounded-xl border border-white/8 px-4 py-3 text-sm text-ivory/45">
                  No line items — this receipt only records a payment.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-start text-xs uppercase tracking-[0.08em] text-ivory/45">
                        <th className="px-4 py-2.5 text-start font-medium">Service</th>
                        <th className="px-4 py-2.5 text-end font-medium">Unit price</th>
                        <th className="px-4 py-2.5 text-end font-medium">Qty</th>
                        <th className="px-4 py-2.5 text-end font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.finance_receipt_items.map((item) => (
                        <tr key={item.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-2.5 text-ivory">{item.service}</td>
                          <td className="px-4 py-2.5 text-end text-ivory/70">{formatUSD(item.unit_price)}</td>
                          <td className="px-4 py-2.5 text-end text-ivory/70">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-end font-medium text-ivory">
                            {formatUSD(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-white/8 p-4 text-sm">
              <span className="text-ivory/50">Subtotal</span>
              <span className="text-end text-ivory">{formatUSD(receipt.subtotal)}</span>
              <span className="text-ivory/50">Discount</span>
              <span className="text-end text-ivory">{formatUSD(receipt.discount)}</span>
              <span className="text-ivory/50">Previous balance</span>
              <span className="text-end text-ivory">{formatUSD(receipt.previous_balance)}</span>
              <span className="border-t border-white/8 pt-3 text-ivory/50">Amount paid</span>
              <span className="border-t border-white/8 pt-3 text-end font-medium text-gold">
                {formatUSD(receipt.amount_paid)}
              </span>
              <span className="text-ivory/50">Remaining balance</span>
              <span className="text-end font-medium text-ivory">{formatUSD(receipt.remaining_balance)}</span>
              <span className="border-t border-white/8 pt-3 text-ivory/50">Exchange rate</span>
              <span className="border-t border-white/8 pt-3 text-end text-ivory">
                {Number(receipt.exchange_rate).toLocaleString("en-US")}
              </span>
              <span className="text-ivory/50">IQD total</span>
              <span className="text-end text-ivory">{formatIQD(receipt.final_total_iqd)}</span>
            </div>

            {receipt.notes ? (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-[0.12em] text-ivory/50">Notes</p>
                <p className="text-sm leading-relaxed text-ivory/70">{receipt.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => void runExport("pdf")}
              disabled={exporting !== null}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
            >
              {exporting === "pdf" ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <Download size={14} aria-hidden />
              )}
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => void runExport("png")}
              disabled={exporting !== null}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-60"
            >
              {exporting === "png" ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <FileImage size={14} aria-hidden />
              )}
              Export PNG
            </button>
          </div>
        </div>
      )}
    </GlassDrawer>
  );
}
