"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, HardDrive, Percent, Package as PackageIcon } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { listMediaLibrary } from "@/lib/supabase/storage";
import { getEffectiveOfferStatus } from "@/lib/promo-status";
import { Skeleton } from "@/components/admin/Skeleton";
import type { PopupType } from "@/types/admin";
import type { PromoStatus } from "@/types/promo";

// Supabase free-tier storage bucket limit — the threshold this warning is
// measured against. Update if the project moves to a paid plan.
const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;
const STORAGE_WARNING_RATIO = 0.8;

type Issue = {
  id: string;
  icon: typeof AlertTriangle;
  label: string;
  href: string;
};

type OfferRow = { id: string; name: string; status: PromoStatus; start_date: string | null; end_date: string | null; show_as_popup: boolean };
type PackageRow = { id: string; name: string; status: PromoStatus; show_as_popup: boolean };

export function SiteHealthPanel() {
  const [issues, setIssues] = useState<Issue[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = getSupabaseClient();
      const [offersRes, packagesRes, settingsRes, storageItems] = await Promise.all([
        supabase.from("offers").select("id, name, status, start_date, end_date, show_as_popup"),
        supabase.from("packages").select("id, name, status, show_as_popup"),
        supabase.from("settings").select("promo_enabled, popup_type").eq("id", 1).maybeSingle(),
        listMediaLibrary().catch(() => []),
      ]);
      if (cancelled) return;

      const offers = (offersRes.data ?? []) as OfferRow[];
      const packages = (packagesRes.data ?? []) as PackageRow[];
      const found: Issue[] = [];

      const expiredOffers = offers.filter(
        (offer) => getEffectiveOfferStatus(offer) === "expired",
      );
      if (expiredOffers.length > 0) {
        found.push({
          id: "expired-offers",
          icon: Percent,
          label:
            expiredOffers.length === 1
              ? `"${expiredOffers[0].name}" has expired and is still published.`
              : `${expiredOffers.length} offers have expired and are still published.`,
          href: "/studio/website/offers",
        });
      }

      const draftPackages = packages.filter((pkg) => pkg.status === "draft");
      if (draftPackages.length > 0) {
        found.push({
          id: "draft-packages",
          icon: PackageIcon,
          label:
            draftPackages.length === 1
              ? `"${draftPackages[0].name}" is unpublished and hidden from the public site.`
              : `${draftPackages.length} packages are unpublished and hidden from the public site.`,
          href: "/studio/website/offers",
        });
      }

      const settings = settingsRes.data as { promo_enabled: boolean; popup_type: PopupType } | null;
      if (settings?.promo_enabled) {
        const needsOffer = settings.popup_type === "offer" && !offers.some((o) => o.show_as_popup);
        const needsPackage = settings.popup_type === "package" && !packages.some((p) => p.show_as_popup);
        if (needsOffer || needsPackage) {
          found.push({
            id: "popup-misconfigured",
            icon: AlertTriangle,
            label: `The popup is enabled but no ${needsOffer ? "offer" : "package"} is flagged to show.`,
            href: "/studio/website/popup",
          });
        }
      }

      const bytes = storageItems.reduce((sum, item) => sum + item.size, 0);
      if (bytes / STORAGE_LIMIT_BYTES >= STORAGE_WARNING_RATIO) {
        found.push({
          id: "storage-almost-full",
          icon: HardDrive,
          label: `Storage is at ${Math.round((bytes / STORAGE_LIMIT_BYTES) * 100)}% of the 1 GB free-tier limit.`,
          href: "/studio/media",
        });
      }

      setIssues(found);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="font-display text-xl text-ivory">Site Health</h2>
      <div className="mt-4">
        {issues === null ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ivory/60">
            <CheckCircle2 size={16} className="flex-none text-emerald-300" aria-hidden />
            Everything looks good — no issues found.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link
                  href={issue.href}
                  className="flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-ivory/80 transition-colors hover:border-gold/40"
                >
                  <issue.icon size={16} className="flex-none text-gold" aria-hidden />
                  <span className="min-w-0 flex-1">{issue.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
