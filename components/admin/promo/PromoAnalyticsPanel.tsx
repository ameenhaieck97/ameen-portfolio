"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { tallyPromoEvents } from "@/lib/promo-analytics";
import type { PromoAnalytics, PromoEventType } from "@/types/promo";

const EMPTY: PromoAnalytics = {
  views: 0,
  popupViews: 0,
  ctaClicks: 0,
  whatsappClicks: 0,
  dismissCount: 0,
  conversionRate: 0,
};

/** Per-item analytics summary — views/clicks/dismisses tallied from `promo_events`, recorded by the public site as visitors interact with this offer/package. */
export function PromoAnalyticsPanel({
  itemKind,
  itemId,
}: {
  itemKind: "offers" | "packages";
  itemId: string;
}) {
  const [stats, setStats] = useState<PromoAnalytics | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSupabaseClient()
      .from("promo_events")
      .select("event_type")
      .eq("item_kind", itemKind)
      .eq("item_id", itemId)
      .then(({ data }) => {
        if (cancelled) return;
        setStats(tallyPromoEvents((data as { event_type: PromoEventType }[] | null) ?? []));
      });
    return () => {
      cancelled = true;
    };
  }, [itemKind, itemId]);

  if (!stats) {
    return (
      <div className="flex items-center gap-2 text-sm text-ivory/45">
        <Loader2 size={14} className="animate-spin" aria-hidden />
        Loading analytics…
      </div>
    );
  }

  const cells: Array<{ label: string; value: string }> = [
    { label: "Views", value: String(stats.views) },
    { label: "Popup views", value: String(stats.popupViews) },
    { label: "CTA clicks", value: String(stats.ctaClicks) },
    { label: "WhatsApp clicks", value: String(stats.whatsappClicks) },
    { label: "Dismissed", value: String(stats.dismissCount) },
    { label: "Conversion (CTR)", value: `${stats.conversionRate.toFixed(1)}%` },
  ];

  const noData = stats === EMPTY || Object.values(stats).every((value) => value === 0);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {cells.map((cell) => (
          <div key={cell.label} className="rounded-xl border border-white/10 bg-canvas/40 px-3.5 py-3">
            <p className="font-display text-xl text-ivory">{cell.value}</p>
            <p className="mt-0.5 text-xs text-ivory/50">{cell.label}</p>
          </div>
        ))}
      </div>
      {noData ? (
        <p className="mt-3 text-xs text-ivory/40">
          No traffic recorded yet — numbers will fill in once this item is published and visited.
        </p>
      ) : null}
    </div>
  );
}
