"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileImage,
  FileDown,
  Loader2,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { GlassDrawer } from "@/components/admin/GlassDrawer";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TextAreaField } from "@/components/admin/FormControls";
import { useToast } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import { exportNodeAsPdf, exportNodeAsPng } from "@/lib/finance/export";
import { ReceiptView } from "@/components/finance/ReceiptView";
import type { FinanceReceipt, FinanceReceiptWithItems } from "@/types/finance";

export function ReceiptDrawer({
  receipts,
  openId,
  onClose,
  onNavigate,
  clientName,
  projectNameById,
  onDeleted,
  onUpdated,
  onPaidToggled,
}: {
  /** Newest-first, exactly as shown in the Financial Timeline — drives Previous/Next. */
  receipts: FinanceReceipt[];
  openId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  clientName: string;
  projectNameById: Map<string, string>;
  onDeleted: (id: string) => void;
  onUpdated: (receipt: { id: string; notes: string; notes_ar: string }) => void;
  onPaidToggled: (id: string, isPaid: boolean) => void;
}) {
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<FinanceReceiptWithItems | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState({ notes: "", notes_ar: "" });
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Clear the previous receipt's content the instant the target id changes,
  // computed directly during render, so stale content never flashes while
  // the new one loads.
  const [prevOpenId, setPrevOpenId] = useState(openId);
  if (openId !== prevOpenId) {
    setPrevOpenId(openId);
    setReceipt(null);
    setQrDataUrl(null);
    setEditingNotes(false);
    setShareOpen(false);
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

  // window is unavailable during the server render pass — the guard makes
  // this "" during SSR and the real URL once mounted client-side, with no
  // state/effect needed just to hold it.
  const publicUrl =
    receipt && typeof window !== "undefined"
      ? `${window.location.origin}/receipt/${receipt.share_token}`
      : "";

  useEffect(() => {
    if (!publicUrl) return;
    let cancelled = false;
    void (async () => {
      const dataUrl = await QRCode.toDataURL(publicUrl, { margin: 1, width: 160 });
      if (!cancelled) setQrDataUrl(dataUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpen]);

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
      setShareOpen(false);
    }
  };

  const togglePaid = async () => {
    if (!receipt) return;
    const nextPaid = !receipt.is_paid;
    setReceipt((current) => (current ? { ...current, is_paid: nextPaid } : current));
    onPaidToggled(receipt.id, nextPaid);
    const { error } = await getSupabaseClient()
      .from("finance_receipts")
      .update({ is_paid: nextPaid })
      .eq("id", receipt.id);
    if (error) {
      setReceipt((current) => (current ? { ...current, is_paid: !nextPaid } : current));
      onPaidToggled(receipt.id, !nextPaid);
      toast(error.message, "error");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast("Link copied.");
    } catch {
      toast("Could not copy the link.", "error");
    }
    setShareOpen(false);
  };

  const startEditingNotes = () => {
    if (!receipt) return;
    setNotesDraft({ notes: receipt.notes, notes_ar: receipt.notes_ar });
    setEditingNotes(true);
  };

  const saveNotes = async () => {
    if (!receipt) return;
    setSavingNotes(true);
    const { error } = await getSupabaseClient()
      .from("finance_receipts")
      .update({ notes: notesDraft.notes, notes_ar: notesDraft.notes_ar })
      .eq("id", receipt.id);
    setSavingNotes(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setReceipt((current) => (current ? { ...current, ...notesDraft } : current));
    onUpdated({ id: receipt.id, ...notesDraft });
    toast("Notes updated.");
    setEditingNotes(false);
  };

  const deleteReceipt = async () => {
    if (!receipt) return;
    setDeleting(true);
    const { error } = await getSupabaseClient().from("finance_receipts").delete().eq("id", receipt.id);
    setDeleting(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Receipt deleted.");
    setDeleteOpen(false);
    onDeleted(receipt.id);
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
          <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />
          <button
            type="button"
            aria-label="Edit notes"
            disabled={!receipt}
            onClick={startEditingNotes}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-30"
          >
            <Pencil size={15} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Delete receipt"
            disabled={!receipt}
            onClick={() => setDeleteOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"
          >
            <Trash2 size={15} aria-hidden />
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
          {editingNotes ? (
            <div className="space-y-4 rounded-2xl border border-gold/25 bg-gold/5 p-4">
              <TextAreaField
                label="Notes"
                rows={2}
                value={notesDraft.notes}
                onChange={(event) => setNotesDraft((current) => ({ ...current, notes: event.target.value }))}
              />
              <TextAreaField
                label="Notes (Arabic)"
                dir="rtl"
                rows={2}
                value={notesDraft.notes_ar}
                onChange={(event) => setNotesDraft((current) => ({ ...current, notes_ar: event.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotes(false)}
                  className="h-9 rounded-lg border border-white/10 px-3 text-xs text-ivory/70 transition-colors hover:border-white/25"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveNotes()}
                  disabled={savingNotes}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gold px-3 text-xs font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
                >
                  {savingNotes ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Check size={13} aria-hidden />}
                  Save
                </button>
              </div>
            </div>
          ) : null}

          <div ref={contentRef}>
            <ReceiptView
              receiptNumber={receipt.receipt_number}
              receiptDate={receipt.receipt_date}
              clientName={clientName}
              projectName={receipt.project_id ? projectNameById.get(receipt.project_id) : null}
              items={receipt.finance_receipt_items}
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void togglePaid()}
              className={
                receipt.is_paid
                  ? "inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-400/15 px-4 text-sm font-medium text-emerald-300 transition-opacity hover:opacity-80"
                  : "inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-4 text-sm text-ivory/70 transition-colors hover:border-gold/40 hover:text-gold"
              }
            >
              <Check size={14} aria-hidden />
              {receipt.is_paid ? "Paid" : "Mark as paid"}
            </button>

            <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShareOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 transition-colors hover:border-gold/40 hover:text-gold"
            >
              <Share2 size={14} aria-hidden />
              Share
              <ChevronDown size={14} aria-hidden className={shareOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {shareOpen ? (
              <div className="glass-strong absolute bottom-full start-0 z-10 mb-2 w-56 rounded-2xl p-1.5">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                >
                  <Copy size={14} aria-hidden />
                  Copy link
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShareOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory"
                >
                  <ExternalLink size={14} aria-hidden />
                  Open public receipt
                </a>
                <button
                  type="button"
                  onClick={() => void runExport("pdf")}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-60"
                >
                  {exporting === "pdf" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <FileDown size={14} aria-hidden />}
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => void runExport("png")}
                  disabled={exporting !== null}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm text-ivory/80 transition-colors hover:bg-white/5 hover:text-ivory disabled:opacity-60"
                >
                  {exporting === "png" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <FileImage size={14} aria-hidden />}
                  Download PNG
                </button>
              </div>
            ) : null}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete receipt?"
        message="This permanently deletes this receipt and its line items. Later receipts' displayed balances won't be recalculated automatically."
        busy={deleting}
        onConfirm={() => void deleteReceipt()}
        onCancel={() => setDeleteOpen(false)}
      />
    </GlassDrawer>
  );
}
