"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";
import {
  LangTabs,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/FormControls";
import { formatDate, formatUSD } from "@/lib/format";
import type {
  FinanceClient,
  FinanceClientRunningBalance,
  FinanceProject,
  FinanceProjectSummary,
} from "@/types/finance";

type ItemDraft = {
  id: string;
  service: string;
  service_ar: string;
  unit_price: string;
  quantity: string;
};

const EMPTY_ITEM = (): ItemDraft => ({
  id: crypto.randomUUID(),
  service: "",
  service_ar: "",
  unit_price: "0",
  quantity: "1",
});

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; client: FinanceClient; projects: FinanceProject[] };

export default function NewReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [projectId, setProjectId] = useState("");
  const [projectSummary, setProjectSummary] = useState<FinanceProjectSummary | null>(null);
  const [runningBalance, setRunningBalance] = useState<FinanceClientRunningBalance | null>(null);
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ItemDraft[]>([EMPTY_ITEM()]);
  const [discount, setDiscount] = useState("0");
  const [exchangeRate, setExchangeRate] = useState("1500");
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");
  const [notesAr, setNotesAr] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [clientResult, projectsResult, runningBalanceResult] = await Promise.all([
        supabase.from("finance_clients").select("*").eq("id", params.id).maybeSingle(),
        supabase
          .from("finance_projects")
          .select("*")
          .eq("client_id", params.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("finance_client_running_balance")
          .select("*")
          .eq("client_id", params.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (clientResult.error || !clientResult.data) {
        setState({ status: "missing" });
        return;
      }
      const projects = (projectsResult.data ?? []) as FinanceProject[];
      setState({ status: "ready", client: clientResult.data as FinanceClient, projects });
      setRunningBalance((runningBalanceResult.data ?? null) as FinanceClientRunningBalance | null);
      // Defaults to "no project" (attach directly to the client) even when
      // projects exist — the recurring-client workflow is the common case,
      // picking a project is an opt-in action.
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Clear the previous project's summary the instant the selection changes,
  // computed directly during render, so stale balances never flash.
  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setProjectSummary(null);
  }

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await getSupabaseClient()
        .from("finance_project_summary")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      if (cancelled) return;
      setProjectSummary((data ?? null) as FinanceProjectSummary | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const setItem = <Key extends keyof ItemDraft>(id: string, key: Key, value: ItemDraft[Key]) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [key]: value } : item)));

  const removeItem = (id: string) =>
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));

  const lineTotal = (item: ItemDraft) => (Number(item.unit_price) || 0) * (Number(item.quantity) || 0);

  // Every row counts, whether or not a service name has been typed in yet —
  // a row shouldn't silently stop counting toward the totals just because
  // its description is still blank.
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + lineTotal(item), 0), [items]);
  const finalTotalUsd = subtotal - (Number(discount) || 0);
  // Previous balance/last payment come from the selected project's own
  // running total, or — with no project selected — the client-level tally
  // of project-less receipts (the recurring-client workflow).
  const previousBalance = projectId
    ? (projectSummary?.remaining_balance ?? 0)
    : (runningBalance?.remaining_balance ?? 0);
  const lastPaymentDate = projectId
    ? (projectSummary?.last_payment_date ?? null)
    : (runningBalance?.last_payment_date ?? null);
  const remainingBalance = Number(previousBalance) + finalTotalUsd - (Number(amountPaid) || 0);
  // IQD total reflects what the client actually still owes (the full
  // remaining balance), not just this receipt's own new charge — that's
  // what's useful to show/hand over in Iraqi dinar.
  const finalTotalIqd = remainingBalance * (Number(exchangeRate) || 0);

  const save = async () => {
    if (subtotal === 0 && (Number(amountPaid) || 0) === 0) {
      toast("This receipt has no charges and no payment — add an amount before saving.", "error");
      return;
    }

    setSaving(true);
    const { error } = await getSupabaseClient().rpc("create_finance_receipt", {
      p_client_id: params.id,
      p_project_id: projectId || null,
      p_receipt_date: receiptDate,
      p_items: items.map((item) => ({
        service: item.service.trim(),
        service_ar: item.service_ar,
        unit_price: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 0,
      })),
      p_discount: Number(discount) || 0,
      p_exchange_rate: Number(exchangeRate) || 0,
      p_amount_paid: Number(amountPaid) || 0,
      p_notes: notes,
      p_notes_ar: notesAr,
    });
    setSaving(false);

    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Receipt created.");
    router.push(`/studio/finance/clients/${params.id}`);
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-sm text-ivory/60">This client no longer exists.</p>
          <Link
            href="/studio/finance/clients"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-soft"
          >
            <ArrowLeft size={15} aria-hidden />
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const { client, projects } = state;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/studio/finance/clients/${client.id}`}
          className="inline-flex items-center gap-2 text-sm text-ivory/55 transition-colors hover:text-gold"
        >
          <ArrowLeft size={15} aria-hidden />
          Back to {client.name}
        </Link>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          Save receipt
        </button>
      </div>

      <h1 className="mt-4 font-display text-3xl text-ivory">New Receipt</h1>

      <div className="mt-6 space-y-6">
          <section className="glass rounded-3xl p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Project (optional)"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="">No project — attach directly to {client.name}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Date"
                type="date"
                value={receiptDate}
                onChange={(event) => setReceiptDate(event.target.value)}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Previous balance
                </p>
                <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm text-ivory/80">
                  {formatUSD(previousBalance)}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Last payment
                </p>
                <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm text-ivory/80">
                  {lastPaymentDate ? formatDate(lastPaymentDate, "en") : "No payments yet"}
                </p>
              </div>
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg text-ivory">Items</h2>
              <LangTabs lang={lang} onChange={setLang} />
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-white/8 p-3">
                  <TextField
                    label="Service"
                    className="min-w-40 flex-1"
                    dir={lang === "ar" ? "rtl" : undefined}
                    value={lang === "en" ? item.service : item.service_ar}
                    onChange={(event) =>
                      setItem(item.id, lang === "en" ? "service" : "service_ar", event.target.value)
                    }
                  />
                  <TextField
                    label="Unit price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-32"
                    value={item.unit_price}
                    onChange={(event) => setItem(item.id, "unit_price", event.target.value)}
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    min="0"
                    step="1"
                    className="w-24"
                    value={item.quantity}
                    onChange={(event) => setItem(item.id, "quantity", event.target.value)}
                  />
                  <div className="w-32">
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                      Total
                    </p>
                    <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm text-ivory/80">
                      {formatUSD(lineTotal(item))}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-xl text-ivory/50 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setItems((current) => [...current, EMPTY_ITEM()])}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
            >
              <Plus size={14} aria-hidden />
              Add row
            </button>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Calculations</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Subtotal
                </p>
                <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm text-ivory/80">
                  {formatUSD(subtotal)}
                </p>
              </div>
              <TextField
                label="Discount (USD)"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
              />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Final total (USD)
                </p>
                <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm font-medium text-gold">
                  {formatUSD(finalTotalUsd)}
                </p>
              </div>
              <TextField
                label="Exchange rate (IQD per USD)"
                type="number"
                min="0"
                step="1"
                value={exchangeRate}
                onChange={(event) => setExchangeRate(event.target.value)}
              />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Final total (IQD)
                </p>
                <p className="rounded-xl border border-white/10 bg-canvas/40 px-4 py-2.5 text-sm text-ivory/80">
                  {Math.round(finalTotalIqd).toLocaleString("en-US")} IQD
                </p>
              </div>
              <TextField
                label="Amount paid (USD)"
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
              />
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Remaining balance
                </p>
                <p className="rounded-xl border border-gold/30 bg-gold/8 px-4 py-2.5 text-sm font-semibold text-gold">
                  {formatUSD(remainingBalance)}
                </p>
              </div>
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg text-ivory">Notes</h2>
              <LangTabs lang={lang} onChange={setLang} />
            </div>
            <div className="mt-5">
              {lang === "en" ? (
                <TextAreaField label="Notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
              ) : (
                <TextAreaField
                  label="Notes (Arabic)"
                  dir="rtl"
                  rows={3}
                  value={notesAr}
                  onChange={(event) => setNotesAr(event.target.value)}
                />
              )}
            </div>
          </section>
      </div>
    </div>
  );
}
