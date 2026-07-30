import "server-only";
import type { SectionTextScales } from "@/types/admin";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";
import { withTimeout } from "./supabase/with-timeout";

/**
 * The About card's photo, set from Studio → Settings. Empty/null means no
 * photo has been uploaded yet — About.tsx falls back to the abstract
 * monogram card in that case, so the site never shows a broken image.
 */
export async function getAboutPhotoUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase.from("settings").select("about_photo_url").eq("id", 1).maybeSingle(),
      1500,
    );

    if (error || !data?.about_photo_url) return null;
    return data.about_photo_url as string;
  } catch (error) {
    console.error("getAboutPhotoUrl: unexpected error, using default:", error);
    return null;
  }
}

/**
 * Shared by every "is this standalone page public?" flag (Packages, Offers,
 * …) — same column shape, same safe fallback. Defaults to "hidden" on any
 * failure, since a page should only ever go public through a deliberate
 * Studio action, never by accident when Supabase is briefly unreachable.
 */
async function getPageVisibility(column: string): Promise<"public" | "hidden"> {
  if (!isSupabaseConfigured()) return "hidden";

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase.from("settings").select(column).eq("id", 1).maybeSingle(),
      1500,
    );

    if (error || !data) return "hidden";
    return (data as unknown as Record<string, unknown>)[column] === "public" ? "public" : "hidden";
  } catch (error) {
    console.error(`getPageVisibility(${column}): unexpected error, defaulting to hidden:`, error);
    return "hidden";
  }
}

/** Whether the public Packages page is linked from nav/footer and indexable. */
export async function getPackagesPageVisibility(): Promise<"public" | "hidden"> {
  return getPageVisibility("packages_page_visibility");
}

/** Whether the public Offers page is linked from nav/footer and indexable. */
export async function getOffersPageVisibility(): Promise<"public" | "hidden"> {
  return getPageVisibility("offers_page_visibility");
}

/**
 * Per-section font-size multipliers, set from Studio → Settings → Text
 * sizes. Empty object on any failure — every section then falls back to its
 * own default (scale 1), never a broken or unreadable size.
 */
export async function getSectionTextScales(): Promise<SectionTextScales> {
  if (!isSupabaseConfigured()) return {};

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase.from("settings").select("section_text_scale").eq("id", 1).maybeSingle(),
      1500,
    );

    if (error || !data?.section_text_scale) return {};
    return data.section_text_scale as SectionTextScales;
  } catch (error) {
    console.error("getSectionTextScales: unexpected error, using defaults:", error);
    return {};
  }
}
