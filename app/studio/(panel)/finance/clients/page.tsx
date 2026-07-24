"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Plus, Search, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";
import { ClientModal } from "@/components/finance/ClientModal";
import type { FinanceClient } from "@/types/finance";

export default function FinanceClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<FinanceClient[] | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FinanceClient | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabaseClient()
        .from("finance_clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        toast(error.message, "error");
        return;
      }
      setClients((data ?? []) as FinanceClient[]);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!clients) return [];
    const query = search.trim().toLowerCase();
    if (query === "") return clients;
    return clients.filter((client) =>
      [client.name, client.company, client.email].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [clients, search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await getSupabaseClient()
      .from("finance_clients")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setClients((current) => (current ?? []).filter((client) => client.id !== deleteTarget.id));
    toast("Client deleted.");
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Clients</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            {clients ? `${clients.length} total` : "Loading…"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft"
        >
          <Plus size={16} aria-hidden />
          New client
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-ivory/35" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, company, or email…"
            className="h-11 w-full rounded-xl border border-white/10 bg-canvas/60 ps-10 pe-4 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold/50"
          />
        </div>
      </div>

      <div className="mt-6">
        {!clients ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-14 text-center text-sm text-ivory/55">
            {clients.length === 0
              ? "No clients yet. Add the first one above."
              : "No clients match your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((client) => (
              <div key={client.id} className="group relative">
                <Link
                  href={`/studio/finance/clients/${client.id}`}
                  className="glass-reveal flex h-full flex-col gap-3 rounded-2xl border border-white/8 p-5 transition-colors hover:border-gold/25"
                >
                  <div>
                    <p className="font-display text-lg text-ivory">{client.name}</p>
                    {client.company ? (
                      <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-gold">
                        {client.company}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto space-y-1.5 text-xs text-ivory/50">
                    {client.email ? (
                      <p className="flex items-center gap-1.5">
                        <Mail size={12} aria-hidden />
                        {client.email}
                      </p>
                    ) : null}
                    {client.phone ? (
                      <p className="flex items-center gap-1.5">
                        <Phone size={12} aria-hidden />
                        {client.phone}
                      </p>
                    ) : null}
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label="Delete client"
                  onClick={(event) => {
                    event.preventDefault();
                    setDeleteTarget(client);
                  }}
                  className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/55 text-ivory/60 opacity-0 backdrop-blur-sm transition-opacity hover:text-red-300 group-hover:opacity-100"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(client) => setClients((current) => [client, ...(current ?? [])])}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete client?"
        message={`This permanently deletes ${deleteTarget?.name ?? "this client"} along with all of their projects, receipts, and payments.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
