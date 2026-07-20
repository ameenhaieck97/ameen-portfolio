"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Loader2, RefreshCw, Search, Trash2, X } from "lucide-react";
import {
  deleteMediaByPath,
  listMediaLibrary,
  type MediaItem,
} from "@/lib/supabase/storage";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { cn } from "@/lib/cn";

function formatSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Reusable media grid. In "manage" mode it exposes copy-URL and delete
 * controls; in "select" mode clicking an image returns its URL to the
 * caller (used by the picker so images are reused, not re-uploaded).
 */
export function MediaGrid({
  mode,
  onSelect,
  reloadSignal,
  multiple = false,
  selected = [],
  onToggle,
}: {
  mode: "manage" | "select";
  onSelect?: (url: string) => void;
  reloadSignal?: number;
  /** When true (select mode only), clicking toggles selection instead of resolving immediately. */
  multiple?: boolean;
  selected?: string[];
  onToggle?: (url: string) => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) setItems(null);
      try {
        const data = await listMediaLibrary();
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load media.");
          setItems([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadSignal]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return q ? items.filter((item) => item.path.toLowerCase().includes(q)) : items;
  }, [items, query]);

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedPath(item.path);
      window.setTimeout(() => setCopiedPath((c) => (c === item.path ? null : c)), 1500);
    } catch {
      toast("Could not copy URL.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMediaByPath(deleteTarget.path);
      setItems((current) =>
        current ? current.filter((item) => item.path !== deleteTarget.path) : current,
      );
      toast("Image deleted from library.");
    } catch {
      toast("Could not delete the image.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            aria-hidden
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-ivory/35"
          />
          <input
            type="search"
            placeholder="Search images…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-canvas/60 ps-10 pe-4 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold/50"
          />
        </div>
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-ivory/70 transition-colors hover:border-white/25"
        >
          <RefreshCw size={15} aria-hidden />
        </button>
      </div>

      <div className="mt-5">
        {items === null ? (
          <div className="flex h-40 items-center justify-center text-ivory/45">
            <Loader2 size={20} className="animate-spin" aria-hidden />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/8 py-14 text-center text-sm text-ivory/50">
            {query ? "No images match your search." : "No images uploaded yet."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => {
              const isSelected = selected.includes(item.url);
              return (
              <div
                key={item.path}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-canvas/60 transition-colors",
                  multiple && isSelected ? "border-gold/70" : "border-white/10",
                )}
              >
                <button
                  type="button"
                  disabled={mode === "manage"}
                  onClick={() => {
                    if (mode !== "select") return;
                    if (multiple) onToggle?.(item.url);
                    else onSelect?.(item.url);
                  }}
                  className={cn(
                    "relative block aspect-square w-full",
                    mode === "select" && "cursor-pointer",
                  )}
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="240px"
                    className="object-contain p-2"
                  />
                  {mode === "select" && multiple ? (
                    <span
                      className={cn(
                        "absolute inset-0 flex items-start justify-end p-2 transition-colors",
                        isSelected ? "bg-gold/15" : "bg-black/0 group-hover:bg-black/20",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-gold bg-gold text-canvas"
                            : "border-white/40 bg-black/40 text-transparent",
                        )}
                      >
                        <Check size={13} aria-hidden />
                      </span>
                    </span>
                  ) : mode === "select" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-gold/0 opacity-0 transition-all group-hover:bg-canvas/70 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-canvas">
                        <Check size={13} aria-hidden />
                        Use
                      </span>
                    </span>
                  ) : null}
                </button>

                <div className="flex items-center justify-between gap-1 border-t border-white/8 px-2.5 py-2">
                  <span className="min-w-0 flex-1 truncate text-[11px] text-ivory/50">
                    {item.name}
                    {item.size ? ` · ${formatSize(item.size)}` : ""}
                  </span>
                  <button
                    type="button"
                    aria-label="Copy URL"
                    onClick={() => void copyUrl(item)}
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ivory/50 transition-colors hover:bg-white/5 hover:text-gold"
                  >
                    {copiedPath === item.path ? (
                      <Check size={13} className="text-gold" aria-hidden />
                    ) : (
                      <Copy size={13} aria-hidden />
                    )}
                  </button>
                  {mode === "manage" ? (
                    <button
                      type="button"
                      aria-label="Delete image"
                      onClick={() => setDeleteTarget(item)}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-ivory/50 transition-colors hover:bg-white/5 hover:text-red-300"
                    >
                      <Trash2 size={13} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete image?"
        message="This permanently removes the image from storage. Anything still using its URL will show a broken image."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/** Modal that lets an uploader field reuse an existing library image. */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  onSelectMultiple,
}: {
  open: boolean;
  onClose: () => void;
  /** Single-select mode: resolves and closes immediately on click. */
  onSelect?: (url: string) => void;
  /** Multi-select mode: user checks images then confirms with a footer button. */
  multiple?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected([]);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute inset-0 bg-black/60"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Media library"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative flex max-h-[85dvh] w-full max-w-3xl flex-col rounded-3xl p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-ivory">Media Library</h2>
                {multiple ? (
                  <p className="mt-0.5 text-xs text-ivory/50">
                    Select one or more images to add.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/70 hover:bg-white/5"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pe-1">
              <MediaGrid
                mode="select"
                multiple={multiple}
                selected={selected}
                onToggle={(url) =>
                  setSelected((current) =>
                    current.includes(url)
                      ? current.filter((item) => item !== url)
                      : [...current, url],
                  )
                }
                onSelect={(url) => {
                  onSelect?.(url);
                  handleClose();
                }}
              />
            </div>
            {multiple ? (
              <div className="mt-4 flex justify-end border-t border-white/8 pt-4">
                <button
                  type="button"
                  disabled={selected.length === 0}
                  onClick={() => {
                    onSelectMultiple?.(selected);
                    handleClose();
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-40"
                >
                  Add {selected.length > 0 ? selected.length : ""} image
                  {selected.length === 1 ? "" : "s"}
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
