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
