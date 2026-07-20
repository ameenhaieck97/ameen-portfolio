"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { revalidatePublicSite } from "@/lib/revalidate-public-site";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImageUploader } from "./ImageUploader";
import { TextAreaField, TextField, Toggle } from "./FormControls";
import { TableSkeleton } from "./Skeleton";
import { useToast } from "./Toast";
import { cn } from "@/lib/cn";

export type EntityField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "toggle" | "image";
  required?: boolean;
  /** Storage folder for image fields */
  folder?: string;
  /** Hide from the list row summary (still editable in the form) */
  listHidden?: boolean;
};

type EntityRow = { id: string; sort_order: number } & Record<string, unknown>;

function emptyDraft(fields: EntityField[]): Record<string, unknown> {
  const draft: Record<string, unknown> = { sort_order: 0 };
  for (const field of fields) {
    draft[field.key] =
      field.type === "toggle" ? true : field.type === "number" ? 0 : "";
  }
  return draft;
}

/**
 * Config-driven CRUD manager used by every "simple" admin module
 * (categories, services, skills, experience, testimonials). Lists rows,
 * creates, edits inline, deletes with confirmation, and supports text,
 * textarea, number, toggle and image fields.
 */
export function EntityManager({
  table,
  title,
  singular,
  description,
  fields,
}: {
  table: string;
  title: string;
  singular: string;
  description?: string;
  fields: EntityField[];
}) {
  const { toast } = useToast();
  const [rows, setRows] = useState<EntityRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(() => emptyDraft(fields));
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EntityRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabaseClient()
        .from(table)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setRows([]);
        return;
      }
      setLoadError(null);
      setRows((data ?? []) as EntityRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [table, reloadKey]);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft(fields));
    setFormOpen(true);
  };

  const openEdit = (row: EntityRow) => {
    const next: Record<string, unknown> = { sort_order: row.sort_order };
    for (const field of fields) next[field.key] = row[field.key];
    setEditingId(row.id);
    setDraft(next);
    setFormOpen(true);
  };

  const save = async () => {
    for (const field of fields) {
      if (field.required && String(draft[field.key] ?? "").trim() === "") {
        toast(`${field.label} is required.`, "error");
        return;
      }
    }
    setSaving(true);
    const supabase = getSupabaseClient();
    const payload = { ...draft, sort_order: Number(draft.sort_order) || 0 };
    const { error } = editingId
      ? await supabase.from(table).update(payload).eq("id", editingId)
      : await supabase.from(table).insert(payload);
    setSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(editingId ? `${singular} updated.` : `${singular} created.`);
    setFormOpen(false);
    setEditingId(null);
    reload();
    revalidatePublicSite();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await getSupabaseClient().from(table).delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast(`${singular} deleted.`);
    reload();
    revalidatePublicSite();
  };

  const summaryFields = useMemo(
    () => fields.filter((field) => !field.listHidden),
    [fields],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">{title}</h1>
          {description ? <p className="mt-1.5 text-sm text-ivory/55">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft"
        >
          <Plus size={16} aria-hidden />
          Add {singular}
        </button>
      </div>

      <AnimatePresence>
        {formOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="glass mt-6 rounded-3xl p-6">
              <h2 className="font-display text-xl text-ivory">
                {editingId ? `Edit ${singular}` : `New ${singular}`}
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {fields.map((field) => {
                  const raw = draft[field.key];
                  switch (field.type) {
                    case "textarea":
                      return (
                        <TextAreaField
                          key={field.key}
                          label={field.label}
                          required={field.required}
                          className="sm:col-span-2"
                          value={String(raw ?? "")}
                          onChange={(event) =>
                            setDraft((d) => ({ ...d, [field.key]: event.target.value }))
                          }
                        />
                      );
                    case "number":
                      return (
                        <TextField
                          key={field.key}
                          label={field.label}
                          type="number"
                          required={field.required}
                          value={String(raw ?? "")}
                          onChange={(event) =>
                            setDraft((d) => ({ ...d, [field.key]: event.target.value }))
                          }
                        />
                      );
                    case "toggle":
                      return (
                        <Toggle
                          key={field.key}
                          label={field.label}
                          checked={Boolean(raw)}
                          onChange={(next) => setDraft((d) => ({ ...d, [field.key]: next }))}
                        />
                      );
                    case "image":
                      return (
                        <div key={field.key} className="sm:col-span-2">
                          <ImageUploader
                            label={field.label}
                            folder={field.folder ?? table}
                            value={typeof raw === "string" && raw ? [raw] : []}
                            onChange={(urls) =>
                              setDraft((d) => ({ ...d, [field.key]: urls[0] ?? "" }))
                            }
                          />
                        </div>
                      );
                    default:
                      return (
                        <TextField
                          key={field.key}
                          label={field.label}
                          required={field.required}
                          value={String(raw ?? "")}
                          onChange={(event) =>
                            setDraft((d) => ({ ...d, [field.key]: event.target.value }))
                          }
                        />
                      );
                  }
                })}
                <TextField
                  label="Sort order"
                  type="number"
                  value={String(draft.sort_order ?? 0)}
                  onChange={(event) =>
                    setDraft((d) => ({ ...d, sort_order: event.target.value }))
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
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
                  {editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6">
        {rows === null ? (
          <TableSkeleton />
        ) : loadError ? (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-sm text-red-300">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setRows(null);
                reload();
              }}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 hover:border-white/25"
            >
              <RefreshCw size={14} aria-hidden />
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-sm text-ivory/55">
            No {title.toLowerCase()} yet. Add the first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="glass-reveal flex items-center gap-4 rounded-2xl border border-white/8 px-5 py-4"
              >
                <span className="w-8 flex-none text-xs tabular-nums text-ivory/35">
                  {String(row.sort_order).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {summaryFields.slice(0, 1).map((field) => (
                    <p key={field.key} className="truncate text-sm font-medium text-ivory">
                      {String(row[field.key] ?? "")}
                    </p>
                  ))}
                  <p className="mt-0.5 truncate text-xs text-ivory/45">
                    {summaryFields
                      .slice(1, 3)
                      .map((field) =>
                        field.type === "toggle"
                          ? `${field.label}: ${row[field.key] ? "yes" : "no"}`
                          : String(row[field.key] ?? ""),
                      )
                      .filter((text) => text.trim() !== "")
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Edit ${singular}`}
                    onClick={() => openEdit(row)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60",
                      "transition-colors hover:bg-white/5 hover:text-gold",
                    )}
                  >
                    <Pencil size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${singular}`}
                    onClick={() => setDeleteTarget(row)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-red-300"
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete ${singular}?`}
        message="This action is permanent and cannot be undone."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
