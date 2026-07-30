"use client";

import { useEffect, useMemo, useState } from "react";
import { Package as PackageIcon, Percent } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { tallyPromoEvents } from "@/lib/promo-analytics";
import { Skeleton } from "@/components/admin/Skeleton";
import type { PromoAnalytics, PromoEventType } from "@/types/promo";

type ItemRow = {
  kind: "offers" | "packages";
  id: string;
  name: string;
  stats: PromoAnalytics;
};

export default function PromoAnalyticsDashboardPage() {
  const [rows, setRows] = useState<ItemRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [offersRes, packagesRes, eventsRes] = await Promise.all([
        supabase.from("offers").select("id, name"),
        supabase.from("packages").select("id, name"),
        supabase.from("promo_events").select("item_kind, item_id, event_type"),
      ]);
      if (cancelled) return;

      const error = offersRes.error || packagesRes.error || eventsRes.error;
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

      const eventsByItem = new Map<string, { event_type: PromoEventType }[]>();
      for (const event of (eventsRes.data as
        | { item_kind: "offers" | "packages"; item_id: string; event_type: PromoEventType }[]
        | null) ?? []) {
        const key = `${event.item_kind}:${event.item_id}`;
        const list = eventsByItem.get(key) ?? [];
        list.push({ event_type: event.event_type });
        eventsByItem.set(key, list);
      }

      const result: ItemRow[] = [];
      for (const [key, events] of eventsByItem.entries()) {
        const [kind, id] = key.split(":") as ["offers" | "packages", string];
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
    const impressions = rows.reduce((sum, row) => sum + row.stats.views + row.stats.popupViews, 0);
    const clicks = rows.reduce((sum, row) => sum + row.stats.ctaClicks + row.stats.whatsappClicks, 0);
    return {
      impressions,
      clicks,
      whatsapp: rows.reduce((sum, row) => sum + row.stats.whatsappClicks, 0),
      dismissed: rows.reduce((sum, row) => sum + row.stats.dismissCount, 0),
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }, [rows]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ivory">Analytics</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        Views, clicks, and conversion across every offer and package — recorded from the public
        Offers/Packages pages and the homepage popup.
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

          <div className="mt-6">
            {rows.length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center text-sm text-ivory/55">
                No traffic recorded yet — numbers will fill in once an offer or package is published
                and visited.
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
                {rows.map((row) => (
                  <div
                    key={`${row.kind}-${row.id}`}
                    className="grid grid-cols-[1fr_repeat(6,4.5rem)] items-center gap-2 border-b border-white/5 px-5 py-3 text-sm last:border-b-0"
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate text-ivory">
                      {row.kind === "offers" ? (
                        <Percent size={13} className="flex-none text-ivory/40" aria-hidden />
                      ) : (
                        <PackageIcon size={13} className="flex-none text-ivory/40" aria-hidden />
                      )}
                      <span className="truncate">{row.name}</span>
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
