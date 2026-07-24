"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { LangTabs, TextAreaField, TextField } from "@/components/admin/FormControls";
import { useToast } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { FinanceClient } from "@/types/finance";

type ClientDraft = {
  name: string;
  name_ar: string;
  company: string;
  company_ar: string;
  email: string;
  phone: string;
  notes: string;
  notes_ar: string;
};

const EMPTY_DRAFT: ClientDraft = {
  name: "",
  name_ar: "",
  company: "",
  company_ar: "",
  email: "",
  phone: "",
  notes: "",
  notes_ar: "",
};

function draftFromClient(client: FinanceClient): ClientDraft {
  return {
    name: client.name,
    name_ar: client.name_ar,
    company: client.company,
    company_ar: client.company_ar,
    email: client.email,
    phone: client.phone,
    notes: client.notes,
    notes_ar: client.notes_ar,
  };
}

export function ClientModal({
  open,
  onClose,
  client,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** Present when editing an existing client, absent when creating one. */
  client?: FinanceClient | null;
  onSaved: (client: FinanceClient) => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<ClientDraft>(EMPTY_DRAFT);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the modal transitions to open, computed directly
  // during render (React's documented pattern) instead of in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(client ? draftFromClient(client) : EMPTY_DRAFT);
      setLang("en");
    }
  }

  const set = <Key extends keyof ClientDraft>(key: Key, value: ClientDraft[Key]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (draft.name.trim() === "") {
      toast("Name is required.", "error");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseClient();
    const payload = { ...draft, name: draft.name.trim() };
    const result = client
      ? await supabase.from("finance_clients").update(payload).eq("id", client.id).select("*").single()
      : await supabase.from("finance_clients").insert(payload).select("*").single();
    setSaving(false);

    if (result.error || !result.data) {
      toast(result.error?.message ?? "Could not save the client.", "error");
      return;
    }
    toast(client ? "Client updated." : "Client added.");
    onSaved(result.data as FinanceClient);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? "Edit client" : "New client"}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        <div className="flex justify-end">
          <LangTabs lang={lang} onChange={setLang} />
        </div>

        {lang === "en" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Name"
              required
              value={draft.name}
              onChange={(event) => set("name", event.target.value)}
            />
            <TextField
              label="Company"
              value={draft.company}
              onChange={(event) => set("company", event.target.value)}
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Name (Arabic)"
              dir="rtl"
              value={draft.name_ar}
              onChange={(event) => set("name_ar", event.target.value)}
            />
            <TextField
              label="Company (Arabic)"
              dir="rtl"
              value={draft.company_ar}
              onChange={(event) => set("company_ar", event.target.value)}
            />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
          />
          <TextField
            label="Phone"
            type="tel"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </div>

        {lang === "en" ? (
          <TextAreaField
            label="Notes"
            rows={3}
            value={draft.notes}
            onChange={(event) => set("notes", event.target.value)}
          />
        ) : (
          <TextAreaField
            label="Notes (Arabic)"
            dir="rtl"
            rows={3}
            value={draft.notes_ar}
            onChange={(event) => set("notes_ar", event.target.value)}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 transition-colors hover:border-white/25"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          {client ? "Save changes" : "Add client"}
        </button>
      </div>
    </Modal>
  );
}
