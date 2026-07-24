"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { LangTabs, TextField } from "@/components/admin/FormControls";
import { useToast } from "@/components/admin/Toast";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { FinanceProject } from "@/types/finance";

type ProjectDraft = { name: string; name_ar: string; total_value: string };

const EMPTY_DRAFT: ProjectDraft = { name: "", name_ar: "", total_value: "0" };

export function ProjectModal({
  open,
  onClose,
  clientId,
  project,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  /** Present when editing an existing project, absent when creating one. */
  project?: FinanceProject | null;
  onSaved: (project: FinanceProject) => void;
}) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the modal transitions to open, computed directly
  // during render (React's documented pattern) instead of in an effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(
        project
          ? { name: project.name, name_ar: project.name_ar, total_value: String(project.total_value) }
          : EMPTY_DRAFT,
      );
      setLang("en");
    }
  }

  const set = <Key extends keyof ProjectDraft>(key: Key, value: ProjectDraft[Key]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (draft.name.trim() === "") {
      toast("Project name is required.", "error");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseClient();
    const payload = {
      client_id: clientId,
      name: draft.name.trim(),
      name_ar: draft.name_ar,
      total_value: Number(draft.total_value) || 0,
    };
    const result = project
      ? await supabase.from("finance_projects").update(payload).eq("id", project.id).select("*").single()
      : await supabase.from("finance_projects").insert(payload).select("*").single();
    setSaving(false);

    if (result.error || !result.data) {
      toast(result.error?.message ?? "Could not save the project.", "error");
      return;
    }
    toast(project ? "Project updated." : "Project added.");
    onSaved(result.data as FinanceProject);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit project" : "New project"}>
      <div className="space-y-5">
        <div className="flex justify-end">
          <LangTabs lang={lang} onChange={setLang} />
        </div>

        {lang === "en" ? (
          <TextField
            label="Project name"
            required
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
          />
        ) : (
          <TextField
            label="Project name (Arabic)"
            dir="rtl"
            value={draft.name_ar}
            onChange={(event) => set("name_ar", event.target.value)}
          />
        )}

        <TextField
          label="Total project value (USD)"
          type="number"
          min="0"
          step="0.01"
          value={draft.total_value}
          onChange={(event) => set("total_value", event.target.value)}
        />
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
          {project ? "Save changes" : "Add project"}
        </button>
      </div>
    </Modal>
  );
}
