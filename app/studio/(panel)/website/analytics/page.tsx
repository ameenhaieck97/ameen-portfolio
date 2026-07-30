"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, MousePointerClick, Network, Package as PackageIcon, Percent } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { tallyPromoEvents } from "@/lib/promo-analytics";
import { Skeleton } from "@/components/admin/Skeleton";
import type { PromoAnalytics, PromoEventType } from "@/types/promo";

type ItemKind = "offers" | "packages" | "portfolio" | "current_work";

type ItemRow = {
  kind: ItemKind;
  id: string;
  name: string;
  stats: PromoAnalytics;
};

const KIND_ICON: Record<ItemKind, typeof Percent> = {
  offers: Percent,
  packages: PackageIcon,
  portfolio: LayoutGrid,
  current_work: Network,
};

const KIND_LABEL: Record<ItemKind, string> = {
  offers: "Offer",
  packages: "Package",
  portfolio: "Portfolio",
  current_work: "Current Work",
};

// Current Work cards are four fixed, hardcoded slots (not a CMS table), so
// their display names live here rather than being fetched.
const CURRENT_WORK_NAMES: Record<string, string> = {
  institute: "Al-Mustafa Foundation for Guidance & Religious Awareness",
  mujeebCenter: "Al-Mujeeb Center for Religious Knowledge",
  najafPodcast: "Najaf Time Podcast",
  iliaApp: "Ilia App",
};

function topByImpressions(rows: ItemRow[], kind: ItemKind): ItemRow | null {
  const candidates = rows.filter((row) => row.kind === kind && row.stats.views > 0);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, row) => (row.stats.views > best.stats.views ? row : best));
}

function topByClicks(rows: ItemRow[]): ItemRow | null {
  const candidates = rows.filter(
    (row) => (row.kind === "offers" || row.kind === "packages") && row.stats.ctaClicks + row.stats.whatsappClicks > 0,
  );
  if (candidates.length === 0) return null;
  return candidates.reduce((best, row) =>
    row.stats.ctaClicks + row.stats.whatsappClicks > best.stats.ctaClicks + best.stats.whatsappClicks ? row : best,
  );
}

export default function PromoAnalyticsDashboardPage() {
  const [rows, setRows] = useState<ItemRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [offersRes, packagesRes, projectsRes, eventsRes] = await Promise.all([
        supabase.from("offers").select("id, name"),
        supabase.from("packages").select("id, name"),
        supabase.from("projects").select("id, title"),
        supabase.from("promo_events").select("item_kind, item_id, event_type"),
      ]);
      if (cancelled) return;

      const error = offersRes.error || packagesRes.error || projectsRes.error || eventsRes.error;
      if (error) {
        setLoadError(error.message);
        setRows([]);
        return;
      }

      const names = new Map<string, string>();
      for (const row of (offersRes.data as { id: string; name: string }[] | null) ?? []) {
        names.set(`offers:${row.id}`, row.name);
      }
      for (const row of (packagesRes.data as { id: string; name: string }[] | null) ?? []) {
        names.set(`packages:${row.id}`, row.name);
      }
      for (const row of (projectsRes.data as { id: string; title: string }[] | null) ?? []) {
        names.set(`portfolio:${row.id}`, row.title);
      }
      for (const [key, name] of Object.entries(CURRENT_WORK_NAMES)) {
        names.set(`current_work:${key}`, name);
      }

      const eventsByItem = new Map<string, { event_type: PromoEventType }[]>();
      for (const event of (eventsRes.data as
        | { item_kind: ItemKind; item_id: string; event_type: PromoEventType }[]
        | null) ?? []) {
        const key = `${event.item_kind}:${event.item_id}`;
        const list = eventsByItem.get(key) ?? [];
        list.push({ event_type: event.event_type });
        eventsByItem.set(key, list);
      }

      const result: ItemRow[] = [];
      for (const [key, events] of eventsByItem.entries()) {
        const [kind, id] = key.split(":") as [ItemKind, string];
        result.push({
          kind,
          id,
          name: names.get(key) ?? "(deleted item)",
          stats: tallyPromoEvents(events),
        });
      }
      result.sort((a, b) => b.stats.views + b.stats.popupViews - (a.stats.views + a.stats.popupViews));

      setLoadError(null);
      setRows(result);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    if (!rows) return null;
    const promoRows = rows.filter((row) => row.kind === "offers" || row.kind === "packages");
    const impressions = promoRows.reduce((sum, row) => sum + row.stats.views + row.stats.popupViews, 0);
    const clicks = promoRows.reduce((sum, row) => sum + row.stats.ctaClicks + row.stats.whatsappClicks, 0);
    return {
      impressions,
      clicks,
      whatsapp: promoRows.reduce((sum, row) => sum + row.stats.whatsappClicks, 0),
      dismissed: promoRows.reduce((sum, row) => sum + row.stats.dismissCount, 0),
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [rows]);

  const highlights = useMemo(() => {
    if (!rows) return null;
    return {
      offer: topByImpressions(rows, "offers"),
      package: topByImpressions(rows, "packages"),
      portfolio: topByImpressions(rows, "portfolio"),
      currentWork: topByImpressions(rows, "current_work"),
      cta: topByClicks(rows),
    };
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ivory">Analytics</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        Views, clicks, and conversion across offers, packages, portfolio, and current work —
        recorded from the public site and the homepage popup.
      </p>

      {rows === null ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : loadError ? (
        <div className="glass mt-6 rounded-3xl p-8 text-center text-sm text-red-300">{loadError}</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total impressions", value: totals?.impressions ?? 0 },
              { label: "Total clicks", value: totals?.clicks ?? 0 },
              { label: "WhatsApp clicks", value: totals?.whatsapp ?? 0 },
              { label: "Overall CTR", value: `${(totals?.ctr ?? 0).toFixed(1)}%` },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4">
                <p className="font-display text-2xl text-ivory">{stat.value}</p>
                <p className="mt-0.5 text-xs text-ivory/50">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[
              { label: "Top offer", row: highlights?.offer, icon: Percent },
              { label: "Top package", row: highlights?.package, icon: PackageIcon },
              { label: "Top portfolio piece", row: highlights?.portfolio, icon: LayoutGrid },
              { label: "Top current work", row: highlights?.currentWork, icon: Network },
              { label: "Most clicked CTA", row: highlights?.cta, icon: MousePointerClick },
            ].map(({ label, row, icon: Icon }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <Icon size={15} className="text-gold" aria-hidden />
                <p className="mt-3 truncate text-sm font-medium text-ivory" title={row?.name}>
                  {row ? row.name : "—"}
                </p>
                <p className="mt-0.5 text-xs text-ivory/50">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            {rows.length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center text-sm text-ivory/55">
                No traffic recorded yet — numbers will fill in once visitors view or click something.
              </div>
            ) : (
              <div className="glass overflow-hidden rounded-3xl">
                <div className="grid grid-cols-[1fr_repeat(6,4.5rem)] gap-2 border-b border-white/8 px-5 py-3 text-xs font-medium uppercase tracking-wide text-ivory/45">
                  <span>Item</span>
                  <span className="text-end">Views</span>
                  <span className="text-end">Popup</span>
                  <span className="text-end">CTA</span>
                  <span className="text-end">WA</span>
                  <span className="text-end">Dismiss</span>
                  <span className="text-end">CTR</span>
                </div>
                {rows.map((row) => {
                  const Icon = KIND_ICON[row.kind];
                  return (
                    <div
                      key={`${row.kind}-${row.id}`}
                      className="grid grid-cols-[1fr_repeat(6,4.5rem)] items-center gap-2 border-b border-white/5 px-5 py-3 text-sm last:border-b-0"
                    >
                      <span className="flex min-w-0 items-center gap-2 truncate text-ivory">
                        <Icon size={13} className="flex-none text-ivory/40" aria-hidden />
                        <span className="truncate" title={`${KIND_LABEL[row.kind]} · ${row.name}`}>
                          {row.name}
                        </span>
                      </span>
                      <span className="text-end text-ivory/70">{row.stats.views}</span>
                      <span className="text-end text-ivory/70">{row.stats.popupViews}</span>
                      <span className="text-end text-ivory/70">{row.stats.ctaClicks}</span>
                      <span className="text-end text-ivory/70">{row.stats.whatsappClicks}</span>
                      <span className="text-end text-ivory/70">{row.stats.dismissCount}</span>
                      <span className="text-end font-medium text-gold">
                        {row.stats.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
