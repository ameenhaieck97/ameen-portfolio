"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Category, ProjectWithCategory } from "@/types/admin";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { TextField } from "@/components/admin/FormControls";
import { useToast } from "@/components/admin/Toast";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 8;

type StatusFilter = "all" | "published" | "draft" | "featured";
type SortKey = "sort_order" | "created_at" | "title" | "year";

type QuickDraft = {
  title: string;
  client: string;
  year: string;
  sort_order: string;
};

function TogglePill({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
  tone,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
  tone: "gold" | "ivory";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? tone === "gold"
            ? "border-gold/60 bg-gold/15 text-gold"
            : "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 text-ivory/45 hover:border-white/25 hover:text-ivory/70",
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProjectWithCategory[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sort_order");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickDraft, setQuickDraft] = useState<QuickDraft>({
    title: "",
    client: "",
    year: "",
    sort_order: "0",
  });
  const [quickSaving, setQuickSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [projectsResult, categoriesResult] = await Promise.all([
        supabase
          .from("projects")
          .select("*, categories(id, name)")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      if (cancelled) return;
      if (projectsResult.error) {
        setLoadError(projectsResult.error.message);
        setRows([]);
        return;
      }
      setLoadError(null);
      setRows((projectsResult.data ?? []) as ProjectWithCategory[]);
      setCategories((categoriesResult.data ?? []) as Category[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const query = search.trim().toLowerCase();
    let result = rows.filter((row) => {
      if (query) {
        const haystack = `${row.title} ${row.client} ${row.slug}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (status === "published" && !row.published) return false;
      if (status === "draft" && row.published) return false;
      if (status === "featured" && !row.featured) return false;
      if (categoryId && row.category_id !== categoryId) return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      let compare = 0;
      if (sortKey === "title") compare = a.title.localeCompare(b.title);
      else if (sortKey === "year") compare = (a.year ?? 0) - (b.year ?? 0);
      else if (sortKey === "created_at")
        compare = a.created_at.localeCompare(b.created_at);
      else compare = a.sort_order - b.sort_order;
      return sortAsc ? compare : -compare;
    });
    return result;
  }, [rows, search, status, categoryId, sortKey, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const patchRow = async (
    row: ProjectWithCategory,
    patch: Partial<ProjectWithCategory>,
    successMessage: string,
  ) => {
    setRows((current) =>
      current
        ? current.map((item) => (item.id === row.id ? { ...item, ...patch } : item))
        : current,
    );
    const { error } = await getSupabaseClient()
      .from("projects")
      .update(patch)
      .eq("id", row.id);
    if (error) {
      setRows((current) =>
        current
          ? current.map((item) => (item.id === row.id ? row : item))
          : current,
      );
      toast(error.message, "error");
    } else {
      toast(successMessage);
    }
  };

  const openQuickEdit = (row: ProjectWithCategory) => {
    setQuickEditId(row.id);
    setQuickDraft({
      title: row.title,
      client: row.client,
      year: row.year === null ? "" : String(row.year),
      sort_order: String(row.sort_order),
    });
  };

  const saveQuickEdit = async () => {
    if (!quickEditId) return;
    if (quickDraft.title.trim() === "") {
      toast("Title is required.", "error");
      return;
    }
    setQuickSaving(true);
    const patch = {
      title: quickDraft.title.trim(),
      client: quickDraft.client,
      year: quickDraft.year.trim() === "" ? null : Number(quickDraft.year),
      sort_order: Number(quickDraft.sort_order) || 0,
    };
    const { error } = await getSupabaseClient()
      .from("projects")
      .update(patch)
      .eq("id", quickEditId);
    setQuickSaving(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setRows((current) =>
      current
        ? current.map((item) =>
            item.id === quickEditId ? { ...item, ...patch } : item,
          )
        : current,
    );
    setQuickEditId(null);
    toast("Project updated.");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await getSupabaseClient()
      .from("projects")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setRows((current) =>
      current ? current.filter((item) => item.id !== deleteTarget.id) : current,
    );
    toast("Project deleted.");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((current) => !current);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Projects</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            {rows ? `${rows.length} total` : "Loading…"}
          </p>
        </div>
        <Link
          href="/studio/projects/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft"
        >
          <Plus size={16} aria-hidden />
          New project
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            size={15}
            aria-hidden
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-ivory/35"
          />
          <input
            type="search"
            placeholder="Search title, client or slug…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-xl border border-white/10 bg-canvas/60 ps-10 pe-4 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} aria-hidden className="text-ivory/35" />
          {(["all", "published", "draft", "featured"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatus(option);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-full border px-3.5 text-xs font-medium capitalize transition-colors",
                status === option
                  ? "border-gold/60 bg-gold/12 text-gold"
                  : "border-white/10 text-ivory/55 hover:border-white/25",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by category"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-white/10 bg-canvas/60 px-3 text-sm text-ivory outline-none focus:border-gold/50"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-5">
        {rows === null ? (
          <TableSkeleton rows={8} />
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
        ) : (
          <div className="glass overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-start text-xs uppercase tracking-[0.12em] text-ivory/45">
                    <th className="px-5 py-4 text-start font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("title")}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-gold",
                          sortKey === "title" && "text-gold",
                        )}
                      >
                        Project
                        <ChevronsUpDown size={12} aria-hidden />
                      </button>
                    </th>
                    {(
                      [
                        ["year", "Year"],
                        ["created_at", "Created"],
                        ["sort_order", "Order"],
                      ] as const
                    ).map(([key, label]) => (
                      <th key={key} className="px-3 py-4 text-start font-medium">
                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className={cn(
                            "inline-flex items-center gap-1 transition-colors hover:text-gold",
                            sortKey === key && "text-gold",
                          )}
                        >
                          {label}
                          <ChevronsUpDown size={12} aria-hidden />
                        </button>
                      </th>
                    ))}
                    <th className="px-3 py-4 text-start font-medium">Status</th>
                    <th className="px-5 py-4 text-end font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-ivory/50">
                        No projects match the current filters.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <Fragment key={row.id}>
                        <tr className="border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/[0.03]">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="relative h-11 w-11 flex-none overflow-hidden rounded-lg border border-white/10 bg-canvas/60">
                                {row.cover_image ? (
                                  <Image
                                    src={row.cover_image}
                                    alt=""
                                    fill
                                    unoptimized
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-ivory/25">
                                    <ImageOff size={15} aria-hidden />
                                  </span>
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-ivory">{row.title}</p>
                                <p className="truncate text-xs text-ivory/45">
                                  {[row.client, row.categories?.name]
                                    .filter(Boolean)
                                    .join(" · ") || row.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 tabular-nums text-ivory/70">
                            {row.year ?? "—"}
                          </td>
                          <td className="px-3 py-3 tabular-nums text-ivory/70">
                            {new Date(row.created_at).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-3 tabular-nums text-ivory/70">
                            {row.sort_order}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <TogglePill
                                active={row.published}
                                activeLabel="Published"
                                inactiveLabel="Draft"
                                tone="ivory"
                                onClick={() =>
                                  void patchRow(
                                    row,
                                    { published: !row.published },
                                    row.published ? "Moved to drafts." : "Published.",
                                  )
                                }
                              />
                              <TogglePill
                                active={row.featured}
                                activeLabel="Featured"
                                inactiveLabel="Feature"
                                tone="gold"
                                onClick={() =>
                                  void patchRow(
                                    row,
                                    { featured: !row.featured },
                                    row.featured ? "Removed from featured." : "Marked as featured.",
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                aria-label="Quick edit"
                                onClick={() =>
                                  quickEditId === row.id
                                    ? setQuickEditId(null)
                                    : openQuickEdit(row)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-ivory/55 transition-colors hover:bg-white/5 hover:text-gold"
                              >
                                {quickEditId === row.id ? (
                                  <X size={15} aria-hidden />
                                ) : (
                                  <Pencil size={15} aria-hidden />
                                )}
                              </button>
                              <Link
                                href={`/studio/projects/${row.id}`}
                                className="rounded-lg px-2.5 py-2 text-xs font-medium text-ivory/70 transition-colors hover:bg-white/5 hover:text-gold"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                aria-label="Delete project"
                                onClick={() => setDeleteTarget(row)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-ivory/55 transition-colors hover:bg-white/5 hover:text-red-300"
                              >
                                <Trash2 size={15} aria-hidden />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {quickEditId === row.id ? (
                          <tr key={`${row.id}-quick`} className="border-b border-white/5 bg-white/[0.02]">
                            <td colSpan={7} className="px-5 py-4">
                              <div className="grid gap-4 sm:grid-cols-4">
                                <TextField
                                  label="Title"
                                  value={quickDraft.title}
                                  onChange={(event) =>
                                    setQuickDraft((d) => ({ ...d, title: event.target.value }))
                                  }
                                />
                                <TextField
                                  label="Client"
                                  value={quickDraft.client}
                                  onChange={(event) =>
                                    setQuickDraft((d) => ({ ...d, client: event.target.value }))
                                  }
                                />
                                <TextField
                                  label="Year"
                                  type="number"
                                  value={quickDraft.year}
                                  onChange={(event) =>
                                    setQuickDraft((d) => ({ ...d, year: event.target.value }))
                                  }
                                />
                                <TextField
                                  label="Sort order"
                                  type="number"
                                  value={quickDraft.sort_order}
                                  onChange={(event) =>
                                    setQuickDraft((d) => ({
                                      ...d,
                                      sort_order: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="mt-4 flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => setQuickEditId(null)}
                                  className="h-10 rounded-xl border border-white/10 px-4 text-sm text-ivory/80 hover:border-white/25"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void saveQuickEdit()}
                                  disabled={quickSaving}
                                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas hover:bg-gold-soft disabled:opacity-60"
                                >
                                  {quickSaving ? (
                                    <Loader2 size={14} className="animate-spin" aria-hidden />
                                  ) : null}
                                  Save
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pageCount > 1 ? (
              <div className="flex items-center justify-between border-t border-white/8 px-5 py-3.5 text-sm text-ivory/55">
                <span>
                  Page {safePage} of {pageCount} · {filtered.length} projects
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory/70 transition-colors hover:border-white/25 disabled:opacity-40"
                  >
                    <ChevronLeft size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={safePage >= pageCount}
                    onClick={() => setPage(safePage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ivory/70 transition-colors hover:border-white/25 disabled:opacity-40"
                  >
                    <ChevronRight size={15} aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete project?"
        message={`"${deleteTarget?.title ?? ""}" and its service links will be permanently removed. Uploaded images stay in storage.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
