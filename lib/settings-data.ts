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
 * Whether the public Packages page is linked from nav/footer and indexable.
 * Defaults to "hidden" on any failure — the safer fallback, since the page
 * should only ever go public through a deliberate Studio action, never by
 * accident when Supabase is briefly unreachable.
 */
export async function getPackagesPageVisibility(): Promise<"public" | "hidden"> {
  if (!isSupabaseConfigured()) return "hidden";

  try {
    const supabase = getServerReadClient();
    const { data, error } = await withTimeout(
      supabase.from("settings").select("packages_page_visibility").eq("id", 1).maybeSingle(),
      1500,
    );

    if (error || !data) return "hidden";
    return data.packages_page_visibility === "public" ? "public" : "hidden";
  } catch (error) {
    console.error("getPackagesPageVisibility: unexpected error, defaulting to hidden:", error);
    return "hidden";
  }
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
