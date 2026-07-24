"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Pencil,
  PiggyBank,
  Plus,
  Receipt as ReceiptIcon,
  Trash2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";
import { ClientModal } from "@/components/finance/ClientModal";
import { ProjectModal } from "@/components/finance/ProjectModal";
import { ReceiptDrawer } from "@/components/finance/ReceiptDrawer";
import { formatDate, formatUSD } from "@/lib/format";
import type {
  FinanceClient,
  FinanceClientSummary,
  FinanceProject,
  FinanceReceipt,
} from "@/types/finance";

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | {
      status: "ready";
      client: FinanceClient;
      summary: FinanceClientSummary | null;
      projects: FinanceProject[];
      receipts: FinanceReceipt[];
    };

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">
        <Icon size={16} aria-hidden />
      </span>
      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-ivory/50">{label}</p>
      <p className="mt-1 font-display text-2xl text-ivory">{value}</p>
    </div>
  );
}

export default function FinanceClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [projectModal, setProjectModal] = useState<{ open: boolean; project: FinanceProject | null }>({
    open: false,
    project: null,
  });
  const [deleteClientOpen, setDeleteClientOpen] = useState(false);
  const [deletingClient, setDeletingClient] = useState(false);
  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [clientResult, summaryResult, projectsResult] = await Promise.all([
        supabase.from("finance_clients").select("*").eq("id", params.id).maybeSingle(),
        supabase.from("finance_client_summary").select("*").eq("client_id", params.id).maybeSingle(),
        supabase
          .from("finance_projects")
          .select("*")
          .eq("client_id", params.id)
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;

      if (clientResult.error || !clientResult.data) {
        setState({ status: "missing" });
        return;
      }

      const projects = (projectsResult.data ?? []) as FinanceProject[];

      const receiptsResult = await supabase
        .from("finance_receipts")
        .select("*")
        .eq("client_id", params.id)
        .order("receipt_date", { ascending: false })
        .order("receipt_number", { ascending: false });
      if (cancelled) return;

      setState({
        status: "ready",
        client: clientResult.data as FinanceClient,
        summary: (summaryResult.data ?? null) as FinanceClientSummary | null,
        projects,
        receipts: (receiptsResult.data ?? []) as FinanceReceipt[],
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const projectNameById = useMemo(() => {
    if (state.status !== "ready") return new Map<string, string>();
    return new Map(state.projects.map((project) => [project.id, project.name]));
  }, [state]);

  const deleteClient = async () => {
    if (state.status !== "ready") return;
    setDeletingClient(true);
    const { error } = await getSupabaseClient()
      .from("finance_clients")
      .delete()
      .eq("id", state.client.id);
    setDeletingClient(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    window.location.assign("/studio/finance/clients");
  };

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
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

  const { client, summary, projects, receipts } = state;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/studio/finance/clients"
        className="inline-flex items-center gap-2 text-sm text-ivory/55 transition-colors hover:text-gold"
      >
        <ArrowLeft size={15} aria-hidden />
        Back to clients
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">{client.name}</h1>
          {client.company ? (
            <p className="mt-1 text-sm uppercase tracking-[0.1em] text-gold">{client.company}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ivory/55">
            {client.email ? <span>{client.email}</span> : null}
            {client.phone ? <span>{client.phone}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {projects.length === 0 ? (
            <button
              type="button"
              onClick={() => setProjectModal({ open: true, project: null })}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-ivory/60 transition-colors hover:border-gold/40 hover:text-gold"
              title="Most clients don't need one — only add a project for one-time work with a fixed contract value."
            >
              <Plus size={14} aria-hidden />
              Add project
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setEditClientOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-ivory/70 transition-colors hover:border-white/25"
          >
            <Pencil size={14} aria-hidden />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteClientOpen(true)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-ivory/70 transition-colors hover:border-red-400/40 hover:text-red-300"
          >
            <Trash2 size={14} aria-hidden />
            Delete
          </button>
        </div>
      </div>

      {client.notes ? (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ivory/55">{client.notes}</p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SummaryCard icon={PiggyBank} label="Total project value" value={formatUSD(summary?.total_project_value ?? 0)} />
        <SummaryCard icon={Wallet} label="Total paid" value={formatUSD(summary?.total_paid ?? 0)} />
        <SummaryCard icon={CreditCard} label="Remaining balance" value={formatUSD(summary?.remaining_balance ?? 0)} />
        <SummaryCard icon={ReceiptIcon} label="Receipts" value={String(summary?.receipt_count ?? 0)} />
        <SummaryCard
          icon={Calendar}
          label="Last payment"
          value={summary?.last_payment_date ? formatDate(summary.last_payment_date, "en") : "—"}
        />
      </div>

      {projects.length > 0 ? (
        <section className="mt-8 glass rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg text-ivory">Projects</h2>
            <button
              type="button"
              onClick={() => setProjectModal({ open: true, project: null })}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-ivory/70 transition-colors hover:border-gold/40 hover:text-gold"
            >
              <Plus size={14} aria-hidden />
              New project
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setProjectModal({ open: true, project })}
                className="glass-reveal flex items-center justify-between gap-3 rounded-xl border border-white/8 px-4 py-3 text-start transition-colors hover:border-gold/25"
              >
                <span className="text-sm text-ivory">{project.name}</span>
                <span className="text-sm font-medium text-gold">{formatUSD(project.total_value)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg text-ivory">Financial timeline</h2>
            <p className="mt-1 text-xs text-ivory/45">
              Every receipt for this client, most recent first — click one for the full details.
            </p>
          </div>
          <Link
            href={`/studio/finance/clients/${client.id}/receipts/new`}
            className="inline-flex h-9 flex-none items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-ivory/70 transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Plus size={14} aria-hidden />
            New receipt
          </Link>
        </div>

        {receipts.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/8 py-10 text-center text-sm text-ivory/50">
            No receipts yet.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {receipts.map((receipt) => (
              <button
                key={receipt.id}
                type="button"
                onClick={() => setOpenReceiptId(receipt.id)}
                className="glass-reveal flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 px-5 py-4 text-start transition-colors hover:border-gold/25"
              >
                <div>
                  <p className="font-display text-base text-ivory">
                    Receipt #{String(receipt.receipt_number).padStart(4, "0")}
                  </p>
                  <p className="mt-0.5 text-xs text-ivory/45">
                    {formatDate(receipt.receipt_date, "en")}
                    {receipt.project_id && projectNameById.get(receipt.project_id)
                      ? ` · ${projectNameById.get(receipt.project_id)}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-end">
                    <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Paid</p>
                    <p className="font-medium text-gold">{formatUSD(receipt.amount_paid)}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Remaining</p>
                    <p className="font-medium text-ivory">{formatUSD(receipt.remaining_balance)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <ReceiptDrawer
        receipts={receipts}
        openId={openReceiptId}
        onClose={() => setOpenReceiptId(null)}
        onNavigate={setOpenReceiptId}
        clientName={client.name}
        projectNameById={projectNameById}
      />

      <ClientModal
        open={editClientOpen}
        onClose={() => setEditClientOpen(false)}
        client={client}
        onSaved={(updated) => setState((current) => (current.status === "ready" ? { ...current, client: updated } : current))}
      />

      <ProjectModal
        open={projectModal.open}
        onClose={() => setProjectModal({ open: false, project: null })}
        clientId={client.id}
        project={projectModal.project}
        onSaved={(saved) =>
          setState((current) => {
            if (current.status !== "ready") return current;
            const exists = current.projects.some((project) => project.id === saved.id);
            return {
              ...current,
              projects: exists
                ? current.projects.map((project) => (project.id === saved.id ? saved : project))
                : [...current.projects, saved],
            };
          })
        }
      />

      <ConfirmDialog
        open={deleteClientOpen}
        title="Delete client?"
        message={`This permanently deletes ${client.name} along with all of their projects, receipts, and payments.`}
        busy={deletingClient}
        onConfirm={() => void deleteClient()}
        onCancel={() => setDeleteClientOpen(false)}
      />
    </div>
  );
}
