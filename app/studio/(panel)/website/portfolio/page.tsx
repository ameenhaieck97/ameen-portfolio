"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ImageOff,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { safeRevalidate } from "@/lib/revalidate";
import type { Category, ProjectWithCategory } from "@/types/admin";
import { GROUP_OPTIONS } from "@/components/admin/ProjectForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SortableGrid } from "@/components/admin/SortableGrid";
import { useToast } from "@/components/admin/Toast";
import { cn } from "@/lib/cn";

type StatusFilter = "all" | "published" | "draft" | "featured";

function IconButton({
  label,
  active,
  activeClass,
  onClick,
  busy,
  children,
}: {
  label: string;
  active?: boolean;
  activeClass?: string;
  onClick: () => void;
  busy?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={busy}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg bg-black/55 backdrop-blur-sm transition-colors disabled:opacity-60",
        active ? (activeClass ?? "text-gold") : "text-ivory/70 hover:text-ivory",
      )}
    >
      {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : children}
    </button>
  );
}

function ProjectCard({
  row,
  draggable,
  busy,
  onTogglePublished,
  onToggleFeatured,
  onDuplicate,
  onDelete,
}: {
  row: ProjectWithCategory;
  draggable: boolean;
  busy: boolean;
  onTogglePublished: () => void;
  onToggleFeatured: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <Link
      href={`/studio/website/portfolio/${row.id}`}
      className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl border border-white/8 bg-canvas-raised transition-colors hover:border-gold/25"
    >
      <div className="absolute inset-0">
        {row.cover_image ? (
          <Image
            src={row.cover_image}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ivory/20">
            <ImageOff size={28} aria-hidden />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/50 to-transparent" />

      {draggable ? (
        <span
          aria-hidden
          className="absolute start-2.5 top-2.5 flex h-9 w-9 cursor-grab items-center justify-center rounded-lg bg-black/55 text-ivory/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        >
          <GripVertical size={15} aria-hidden />
        </span>
      ) : null}

      <div className="absolute end-2.5 top-2.5 flex flex-col items-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          label={row.published ? "Unpublish" : "Publish"}
          active={row.published}
          activeClass="text-emerald-300"
          busy={busy}
          onClick={onTogglePublished}
        >
          {row.published ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
        </IconButton>
        <IconButton
          label={row.featured ? "Remove from featured" : "Mark as featured"}
          active={row.featured}
          busy={busy}
          onClick={onToggleFeatured}
        >
          <Star size={14} aria-hidden fill={row.featured ? "currentColor" : "none"} />
        </IconButton>
        <IconButton label="Duplicate project" busy={busy} onClick={onDuplicate}>
          <Copy size={14} aria-hidden />
        </IconButton>
        <IconButton label="Delete project" busy={busy} onClick={onDelete}>
          <Trash2 size={14} aria-hidden />
        </IconButton>
      </div>

      <div className="relative mt-auto flex flex-col gap-1 p-4">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]",
            row.published
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-white/10 text-ivory/60",
          )}
        >
          {row.published ? "Published" : "Draft"}
        </span>
        <p className="mt-1 truncate text-xs uppercase tracking-[0.15em] text-gold">
          {row.categories?.name ?? "Uncategorized"}
        </p>
        <p className="truncate font-display text-base text-ivory">{row.title}</p>
        <p className="truncate text-xs text-ivory/50">{row.client || "—"}</p>
      </div>
    </Link>
  );
}

/**
 * One independently-ordered portfolio section. Dragging only ever changes
 * this component's own local state — nothing is written to Supabase until
 * "Save Order" is clicked, and that write only ever touches this group's
 * rows, so reordering Brand Identity can never affect Graphic Design.
 */
function PortfolioGroupSection({
  groupKey,
  label,
  rows,
  filtersActive,
  busyId,
  onTogglePublished,
  onToggleFeatured,
  onDuplicate,
  onDelete,
  onOrderSaved,
}: {
  groupKey: string;
  label: string;
  rows: ProjectWithCategory[];
  filtersActive: boolean;
  busyId: string | null;
  onTogglePublished: (row: ProjectWithCategory) => void;
  onToggleFeatured: (row: ProjectWithCategory) => void;
  onDuplicate: (row: ProjectWithCategory) => void;
  onDelete: (row: ProjectWithCategory) => void;
  onOrderSaved: (groupKey: string, next: ProjectWithCategory[]) => void;
}) {
  const { toast } = useToast();
  const [prevRows, setPrevRows] = useState(rows);
  const [order, setOrder] = useState(rows);
  const [savedOrderIds, setSavedOrderIds] = useState(() => rows.map((row) => row.id));
  const [saving, setSaving] = useState(false);

  // Adjust local state when the incoming `rows` prop changes, computed
  // directly during render (React's documented pattern for this) rather
  // than in an effect — avoids an extra commit/cascading re-render.
  if (rows !== prevRows) {
    setPrevRows(rows);
    const currentIds = new Set(order.map((row) => row.id));
    const nextIds = new Set(rows.map((row) => row.id));
    const sameMembers =
      currentIds.size === nextIds.size && [...currentIds].every((id) => nextIds.has(id));
    if (sameMembers) {
      // Membership unchanged (e.g. a publish/feature toggle) — refresh each
      // item's data in place without disturbing any unsaved local drag order.
      const byId = new Map(rows.map((row) => [row.id, row]));
      setOrder(order.map((row) => byId.get(row.id) ?? row));
    } else {
      // A project was added to or removed from this group (create/duplicate/
      // delete) — any unsaved local reorder is discarded in favor of the
      // server's current order for this group.
      setOrder(rows);
      setSavedOrderIds(rows.map((row) => row.id));
    }
  }

  const dirty = order.map((row) => row.id).join(",") !== savedOrderIds.join(",");

  const saveOrder = async () => {
    setSaving(true);
    const supabase = getSupabaseClient();
    const results = await Promise.all(
      order.map((row, index) =>
        supabase.from("projects").update({ sort_order: index }).eq("id", row.id),
      ),
    );
    setSaving(false);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      toast(failed.error.message, "error");
      return;
    }
    const reordered = order.map((row, index) => ({ ...row, sort_order: index }));
    setSavedOrderIds(reordered.map((row) => row.id));
    onOrderSaved(groupKey, reordered);
    toast(`${label} order saved.`);
    void safeRevalidate(toast);
  };

  if (filtersActive && order.length === 0) return null;

  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ivory">{label}</h2>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void saveOrder()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gold/40 px-4 text-sm font-medium text-gold transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-ivory/30"
        >
          {saving ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Save size={14} aria-hidden />}
          Save Order
        </button>
      </div>

      <div className="mt-5">
        {order.length === 0 ? (
          <div className="rounded-2xl border border-white/8 py-10 text-center text-sm text-ivory/50">
            No projects here yet.
          </div>
        ) : filtersActive ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {order.map((row) => (
              <ProjectCard
                key={row.id}
                row={row}
                draggable={false}
                busy={busyId === row.id}
                onTogglePublished={() => onTogglePublished(row)}
                onToggleFeatured={() => onToggleFeatured(row)}
                onDuplicate={() => onDuplicate(row)}
                onDelete={() => onDelete(row)}
              />
            ))}
          </div>
        ) : (
          <SortableGrid
            items={order}
            onReorder={setOrder}
            className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
            renderItem={(row) => (
              <ProjectCard
                row={row}
                draggable
                busy={busyId === row.id}
                onTogglePublished={() => onTogglePublished(row)}
                onToggleFeatured={() => onToggleFeatured(row)}
                onDuplicate={() => onDuplicate(row)}
                onDelete={() => onDelete(row)}
              />
            )}
          />
        )}
      </div>
    </section>
  );
}

export default function PortfolioPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProjectWithCategory[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
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
          .order("sort_order", { ascending: true }),
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

  const filtersActive = search.trim() !== "" || status !== "all" || categoryId !== "";

  const filtered = useMemo(() => {
    if (!rows) return [];
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
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
  }, [rows, search, status, categoryId]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, ProjectWithCategory[]>();
    for (const option of GROUP_OPTIONS) groups.set(option.value, []);
    const fallback = groups.get("other")!;
    for (const row of filtered) {
      const bucket = groups.get(row.group_key) ?? fallback;
      bucket.push(row);
    }
    return groups;
  }, [filtered]);

  const patch = async (
    row: ProjectWithCategory,
    patchValue: { published: boolean } | { featured: boolean },
    successMessage: string,
  ) => {
    setBusyId(row.id);
    setRows((current) =>
      current ? current.map((item) => (item.id === row.id ? { ...item, ...patchValue } : item)) : current,
    );
    const { error } = await getSupabaseClient()
      .from("projects")
      .update(patchValue)
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      setRows((current) =>
        current ? current.map((item) => (item.id === row.id ? row : item)) : current,
      );
      toast(error.message, "error");
      return;
    }
    toast(successMessage);
    void safeRevalidate(toast);
  };

  const duplicateProject = async (row: ProjectWithCategory) => {
    setBusyId(row.id);
    try {
      const supabase = getSupabaseClient();
      const groupRows = (rows ?? []).filter((item) => item.group_key === row.group_key);
      const maxSort = groupRows.length > 0 ? Math.max(...groupRows.map((item) => item.sort_order)) : 0;
      const { data: links } = await supabase
        .from("project_services")
        .select("service_id")
        .eq("project_id", row.id);
      const payload = {
        title: `${row.title} (Copy)`,
        title_ar: row.title_ar,
        slug: `${row.slug}-copy-${crypto.randomUUID().slice(0, 8)}`,
        short_description: row.short_description,
        short_description_ar: row.short_description_ar,
        full_description: row.full_description,
        full_description_ar: row.full_description_ar,
        client: row.client,
        year: row.year,
        category_id: row.category_id,
        group_key: row.group_key,
        category_key: row.category_key,
        preserve_color: row.preserve_color,
        technologies: row.technologies,
        featured: false,
        published: false,
        cover_image: row.cover_image,
        gallery_images: row.gallery_images,
        sort_order: maxSort + 1,
      };
      const insertResult = await supabase
        .from("projects")
        .insert(payload)
        .select("*, categories(id, name)")
        .single();
      if (insertResult.error || !insertResult.data) {
        toast(insertResult.error?.message ?? "Could not duplicate the project.", "error");
        return;
      }
      if (links && links.length > 0) {
        await supabase.from("project_services").insert(
          links.map((link) => ({
            project_id: insertResult.data.id,
            service_id: link.service_id,
          })),
        );
      }
      setRows((current) =>
        current ? [...current, insertResult.data as ProjectWithCategory] : current,
      );
      toast("Project duplicated as a draft.");
      void safeRevalidate(toast);
    } catch {
      toast("Could not duplicate the project.", "error");
    } finally {
      setBusyId(null);
    }
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
    void safeRevalidate(toast);
  };

  const handleOrderSaved = (groupKey: string, next: ProjectWithCategory[]) => {
    setRows((current) => {
      if (!current) return current;
      const byId = new Map(next.map((row) => [row.id, row]));
      return current.map((row) => (row.group_key === groupKey ? (byId.get(row.id) ?? row) : row));
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Portfolio</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            {rows ? `${rows.length} total` : "Loading…"} — organized exactly as it appears on
            the website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/studio/categories"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-ivory/70 transition-colors hover:border-white/25"
          >
            <Layers size={14} aria-hidden />
            Categories
          </Link>
          <Link
            href="/studio/services"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-sm text-ivory/70 transition-colors hover:border-white/25"
          >
            <Tag size={14} aria-hidden />
            Services
          </Link>
          <Link
            href="/studio/website/portfolio/new"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft"
          >
            <Plus size={16} aria-hidden />
            New project
          </Link>
        </div>
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
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-canvas/60 ps-10 pe-4 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} aria-hidden className="text-ivory/35" />
          {(["all", "published", "draft", "featured"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
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
          onChange={(event) => setCategoryId(event.target.value)}
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

      {!filtersActive && rows && rows.length > 1 ? (
        <p className="mt-3 text-xs text-ivory/40">
          Drag within a section to reorder, then click that section&apos;s Save Order — clear
          filters and search to enable dragging.
        </p>
      ) : null}

      <div className="mt-5">
        {rows === null ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/6" />
            ))}
          </div>
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
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-14 text-center text-sm text-ivory/55">
            {rows.length === 0
              ? "No projects yet. Create the first one above."
              : "No projects match the current filters."}
          </div>
        ) : (
          <div className="space-y-6">
            {GROUP_OPTIONS.map((option) => (
              <PortfolioGroupSection
                key={option.value}
                groupKey={option.value}
                label={option.label}
                rows={groupedRows.get(option.value) ?? []}
                filtersActive={filtersActive}
                busyId={busyId}
                onTogglePublished={(row) =>
                  void patch(
                    row,
                    { published: !row.published },
                    row.published ? "Moved to drafts." : "Published.",
                  )
                }
                onToggleFeatured={(row) =>
                  void patch(
                    row,
                    { featured: !row.featured },
                    row.featured ? "Removed from featured." : "Marked as featured.",
                  )
                }
                onDuplicate={(row) => void duplicateProject(row)}
                onDelete={(row) => setDeleteTarget(row)}
                onOrderSaved={handleOrderSaved}
              />
            ))}
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
