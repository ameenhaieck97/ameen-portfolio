"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eye,
  Loader2,
  Package as PackageIcon,
  Pencil,
  Percent,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { safeRevalidate } from "@/lib/revalidate";
import { getEffectiveOfferStatus } from "@/lib/promo-status";
import { GlassDrawer } from "@/components/admin/GlassDrawer";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TableSkeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";
import { OfferForm, type OfferDraft } from "@/components/admin/promo/OfferForm";
import { PackageForm, type PackageDraft } from "@/components/admin/promo/PackageForm";
import { PromoPreviewModal } from "@/components/admin/promo/PromoPreviewModal";
import { PromoAnalyticsPanel } from "@/components/admin/promo/PromoAnalyticsPanel";
import type { PromoCardProps } from "@/components/ui/PromoCard";
import type { Offer, Package, PackageFeature } from "@/types/promo";
import { cn } from "@/lib/cn";

type OfferRow = Offer & { kind: "offer" };
type PackageRow = Package & { kind: "package" };
type Row = OfferRow | PackageRow;

function emptyOfferDraft(): OfferDraft {
  return {
    name: "",
    name_ar: "",
    offer_type: "percentage",
    offer_value: "",
    description: "",
    description_ar: "",
    image_url: "",
    accent_color: "#EEDF7A",
    cta_text: "",
    cta_text_ar: "",
    cta_link: "",
    start_date: null,
    end_date: null,
    status: "draft",
    expiration_action: "hide",
    show_as_popup: false,
    sort_order: 0,
  };
}

function emptyPackageDraft(): PackageDraft {
  return {
    name: "",
    name_ar: "",
    short_description: "",
    short_description_ar: "",
    full_description: "",
    full_description_ar: "",
    image_url: "",
    accent_color: "#EEDF7A",
    price: 0,
    currency: "USD",
    billing_period: "one_time",
    execution_time: "",
    revisions: "",
    badge: "",
    is_primary: false,
    show_as_popup: false,
    status: "draft",
    sort_order: 0,
    features: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function offerToDraft({ id, created_at, updated_at, ...rest }: Offer): OfferDraft {
  return rest;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function packageToDraft({ id, created_at, updated_at, features, ...rest }: Package): PackageDraft {
  return { ...rest, features: features.map((f) => ({ id: f.id, label: f.label, label_ar: f.label_ar })) };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong.";
}

const OFFER_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
};

const OFFER_STATUS_CLASS: Record<string, string> = {
  draft: "bg-white/8 text-ivory/60",
  scheduled: "bg-blue-400/15 text-blue-300",
  active: "bg-emerald-400/15 text-emerald-300",
  expired: "bg-red-400/15 text-red-300",
};

export default function OffersAndPackagesPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  const [editing, setEditing] = useState<
    | { kind: "offer"; id: string | null; draft: OfferDraft }
    | { kind: "package"; id: string | null; draft: PackageDraft }
    | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewCard, setPreviewCard] = useState<PromoCardProps | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [offersRes, packagesRes, featuresRes] = await Promise.all([
        supabase.from("offers").select("*").order("sort_order", { ascending: true }),
        supabase.from("packages").select("*").order("sort_order", { ascending: true }),
        supabase.from("package_features").select("*").order("sort_order", { ascending: true }),
      ]);
      if (cancelled) return;

      const error = offersRes.error || packagesRes.error || featuresRes.error;
      if (error) {
        setLoadError(error.message);
        setRows([]);
        return;
      }

      const featuresByPackage = new Map<string, PackageFeature[]>();
      for (const feature of (featuresRes.data as PackageFeature[] | null) ?? []) {
        const list = featuresByPackage.get(feature.package_id) ?? [];
        list.push(feature);
        featuresByPackage.set(feature.package_id, list);
      }

      const offerRows: OfferRow[] = ((offersRes.data as Offer[] | null) ?? []).map((row) => ({
        ...row,
        kind: "offer",
      }));
      const packageRows: PackageRow[] = ((packagesRes.data as Omit<Package, "features">[] | null) ?? []).map(
        (row) => ({ ...row, kind: "package", features: featuresByPackage.get(row.id) ?? [] }),
      );

      setLoadError(null);
      setRows([...offerRows, ...packageRows]);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const nextSortOrder = useMemo(
    () => (rows && rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0),
    [rows],
  );

  const openCreateOffer = () =>
    setEditing({ kind: "offer", id: null, draft: { ...emptyOfferDraft(), sort_order: nextSortOrder } });
  const openCreatePackage = () =>
    setEditing({ kind: "package", id: null, draft: { ...emptyPackageDraft(), sort_order: nextSortOrder } });
  const openEdit = (row: Row) =>
    row.kind === "offer"
      ? setEditing({ kind: "offer", id: row.id, draft: offerToDraft(row) })
      : setEditing({ kind: "package", id: row.id, draft: packageToDraft(row) });

  const save = async () => {
    if (!editing) return;
    if (!editing.draft.name.trim()) {
      toast("Name is required.", "error");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseClient();

    try {
      let id = editing.id;

      if (editing.kind === "offer") {
        const payload = editing.draft;
        if (id) {
          const { error } = await supabase.from("offers").update(payload).eq("id", id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("offers").insert(payload).select("id").single();
          if (error) throw error;
          id = (data as { id: string }).id;
        }
        if (editing.draft.show_as_popup) {
          const { error } = await supabase.rpc("set_promo_popup", { p_kind: "offers", p_id: id });
          if (error) throw error;
        }
      } else {
        const { features, ...payload } = editing.draft;
        if (id) {
          const { error } = await supabase.from("packages").update(payload).eq("id", id);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("packages").insert(payload).select("id").single();
          if (error) throw error;
          id = (data as { id: string }).id;
        }

        const { error: deleteError } = await supabase
          .from("package_features")
          .delete()
          .eq("package_id", id);
        if (deleteError) throw deleteError;

        if (features.length > 0) {
          const { error: insertError } = await supabase.from("package_features").insert(
            features.map((feature, index) => ({
              package_id: id,
              label: feature.label,
              label_ar: feature.label_ar,
              sort_order: index,
            })),
          );
          if (insertError) throw insertError;
        }

        if (editing.draft.show_as_popup) {
          const { error } = await supabase.rpc("set_promo_popup", { p_kind: "packages", p_id: id });
          if (error) throw error;
        }
      }

      toast(editing.id ? "Saved." : "Created.");
      setEditing(null);
      reload();
      void safeRevalidate(toast);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async (row: Row) => {
    const supabase = getSupabaseClient();
    try {
      if (row.kind === "offer") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, kind, ...rest } = row;
        const { error } = await supabase.from("offers").insert({
          ...rest,
          name: `${rest.name} (Copy)`,
          status: "draft",
          show_as_popup: false,
          sort_order: nextSortOrder,
        });
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, kind, features, ...rest } = row;
        const { data, error } = await supabase
          .from("packages")
          .insert({
            ...rest,
            name: `${rest.name} (Copy)`,
            status: "draft",
            show_as_popup: false,
            is_primary: false,
            sort_order: nextSortOrder,
          })
          .select("id")
          .single();
        if (error) throw error;
        const newId = (data as { id: string }).id;
        if (features.length > 0) {
          const { error: featError } = await supabase.from("package_features").insert(
            features.map((feature, index) => ({
              package_id: newId,
              label: feature.label,
              label_ar: feature.label_ar,
              sort_order: index,
            })),
          );
          if (featError) throw featError;
        }
      }
      toast("Duplicated.");
      reload();
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const table = deleteTarget.kind === "offer" ? "offers" : "packages";
    const { error } = await getSupabaseClient().from(table).delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Deleted.");
    reload();
    void safeRevalidate(toast);
  };

  const openPreview = (row: Row) => {
    if (row.kind === "offer") {
      setPreviewCard({
        kind: "offer",
        eyebrow: "Offer",
        title: row.name || "Untitled offer",
        description: row.description,
        imageUrl: row.image_url,
        accentColor: row.accent_color,
        priceLabel: row.offer_value,
        endDate: row.end_date,
        ctaText: row.cta_text || "Learn more",
        ctaHref: row.cta_link || "#",
      });
    } else {
      setPreviewCard({
        kind: "package",
        eyebrow: "Package",
        title: row.name || "Untitled package",
        description: row.short_description,
        imageUrl: row.image_url,
        accentColor: row.accent_color,
        badge: row.badge || undefined,
        priceLabel: `${row.currency === "USD" ? "$" : ""}${row.price}${row.currency === "IQD" ? " IQD" : ""}${row.billing_period === "monthly" ? " / mo" : ""}`,
        features: row.features.map((f) => f.label).filter(Boolean),
        ctaText: "Learn more",
        ctaHref: "#",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ivory">Offers &amp; Packages</h1>
          <p className="mt-1.5 text-sm text-ivory/55">
            Manage every offer and package from one place. Feature one as the homepage popup from
            Website → Popup Manager.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={openCreateOffer}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-ivory transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Plus size={16} aria-hidden />
            Add Offer
          </button>
          <button
            type="button"
            onClick={openCreatePackage}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft"
          >
            <Plus size={16} aria-hidden />
            Add Package
          </button>
        </div>
      </div>

      <div className="mt-6">
        {rows === null ? (
          <TableSkeleton />
        ) : loadError ? (
          <div className="glass rounded-3xl p-8 text-center text-sm text-red-300">{loadError}</div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-sm text-ivory/55">
            No offers or packages yet. Add your first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => {
              const isOffer = row.kind === "offer";
              const statusKey = isOffer ? getEffectiveOfferStatus(row) : row.status;
              const statusLabel = isOffer
                ? OFFER_STATUS_LABEL[statusKey]
                : statusKey === "published"
                  ? "Published"
                  : "Draft";
              const statusClass = isOffer
                ? OFFER_STATUS_CLASS[statusKey]
                : statusKey === "published"
                  ? OFFER_STATUS_CLASS.active
                  : OFFER_STATUS_CLASS.draft;

              return (
                <li
                  key={`${row.kind}-${row.id}`}
                  className="glass-reveal flex items-center gap-4 rounded-2xl border border-white/8 px-5 py-4"
                >
                  <span
                    aria-hidden
                    style={{ backgroundColor: row.accent_color }}
                    className="h-2.5 w-2.5 flex-none rounded-full"
                  />
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/5 text-ivory/60">
                    {isOffer ? <Percent size={15} aria-hidden /> : <PackageIcon size={15} aria-hidden />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-ivory">
                        {row.name || "Untitled"}
                      </p>
                      <span
                        className={cn(
                          "flex-none rounded-full px-2 py-0.5 text-[11px] font-medium",
                          statusClass,
                        )}
                      >
                        {statusLabel}
                      </span>
                      {row.show_as_popup ? (
                        <span className="flex flex-none items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold">
                          <Star size={10} aria-hidden />
                          Popup
                        </span>
                      ) : null}
                      {!isOffer && row.is_primary ? (
                        <span className="flex-none rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-ivory/70">
                          Primary
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ivory/45">
                      {isOffer ? row.offer_value || "—" : `${row.price} ${row.currency}`}
                    </p>
                  </div>
                  <div className="flex flex-none items-center gap-1">
                    <button
                      type="button"
                      aria-label="Preview"
                      onClick={() => openPreview(row)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-ivory"
                    >
                      <Eye size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Duplicate"
                      onClick={() => void duplicate(row)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-ivory"
                    >
                      <Copy size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit"
                      onClick={() => openEdit(row)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => setDeleteTarget(row)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ivory/60 transition-colors hover:bg-white/5 hover:text-red-300"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <GlassDrawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.id ? "Edit" : "New"} ${editing.kind}` : ""}
      >
        {editing?.kind === "offer" ? (
          <OfferForm
            draft={editing.draft}
            onChange={(next) => setEditing({ ...editing, draft: next })}
          />
        ) : editing?.kind === "package" ? (
          <PackageForm
            draft={editing.draft}
            onChange={(next) => setEditing({ ...editing, draft: next })}
          />
        ) : null}

        {editing?.id ? (
          <div className="mt-8 border-t border-white/8 pt-6">
            <h3 className="mb-3 font-display text-base text-ivory">Analytics</h3>
            <PromoAnalyticsPanel
              itemKind={editing.kind === "offer" ? "offers" : "packages"}
              itemId={editing.id}
            />
          </div>
        ) : null}

        {editing ? (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
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
              {editing.id ? "Save changes" : "Create"}
            </button>
          </div>
        ) : null}
      </GlassDrawer>

      <PromoPreviewModal
        open={previewCard !== null}
        onClose={() => setPreviewCard(null)}
        card={previewCard ?? { kind: "offer", eyebrow: "", title: "", accentColor: "#EEDF7A" }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete ${deleteTarget?.name || "this item"}?`}
        message="This action is permanent and cannot be undone."
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
