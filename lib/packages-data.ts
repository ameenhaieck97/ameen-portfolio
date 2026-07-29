import "server-only";
import type { Package, PackageFeature } from "@/types/promo";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";
import { withTimeout } from "./supabase/with-timeout";

/**
 * The single package currently flagged "show as popup", if it's published.
 * Includes its ordered feature checklist. Returns null on anything short of
 * that so the popup never renders a broken/empty package.
 */
export async function getPopupPackage(): Promise<Package | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase
        .from("packages")
        .select("*")
        .eq("show_as_popup", true)
        .eq("status", "published")
        .maybeSingle(),
      1500,
    );

    if (error || !data) return null;
    const pkg = data as Omit<Package, "features">;

    const { data: features } = await withTimeout(
      supabase
        .from("package_features")
        .select("*")
        .eq("package_id", pkg.id)
        .order("sort_order", { ascending: true }),
      1500,
    );

    return { ...pkg, features: (features as PackageFeature[] | null) ?? [] };
  } catch (error) {
    console.error("getPopupPackage: unexpected error, hiding popup:", error);
    return null;
  }
}

/**
 * Every published package for the public Packages page, in the Studio's
 * custom drag-ordered sequence, each with its ordered feature checklist.
 * Returns an empty array (not an error state) on any failure so the page
 * degrades to "nothing to show yet" rather than a broken page.
 */
export async function getPublishedPackages(): Promise<Package[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase
        .from("packages")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      1500,
    );

    if (error || !data) return [];
    const packages = data as Omit<Package, "features">[];
    if (packages.length === 0) return [];

    const { data: features } = await withTimeout(
      supabase
        .from("package_features")
        .select("*")
        .in(
          "package_id",
          packages.map((pkg) => pkg.id),
        )
        .order("sort_order", { ascending: true }),
      1500,
    );

    const featuresByPackage = new Map<string, PackageFeature[]>();
    for (const feature of (features as PackageFeature[] | null) ?? []) {
      const list = featuresByPackage.get(feature.package_id) ?? [];
      list.push(feature);
      featuresByPackage.set(feature.package_id, list);
    }

    return packages.map((pkg) => ({ ...pkg, features: featuresByPackage.get(pkg.id) ?? [] }));
  } catch (error) {
    console.error("getPublishedPackages: unexpected error, using empty list:", error);
    return [];
  }
}
