import "server-only";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";

export const CURRENT_WORK_KEYS = ["institute", "mujeebCenter", "najafPodcast", "iliaApp"] as const;
export type CurrentWorkKey = (typeof CURRENT_WORK_KEYS)[number];
export type CurrentWorkGalleries = Record<CurrentWorkKey, string[]>;

function emptyGalleries(): CurrentWorkGalleries {
  return { institute: [], mujeebCenter: [], najafPodcast: [], iliaApp: [] };
}

/**
 * Design uploads for each of the four "Currently" ecosystem cards. If
 * Supabase isn't configured, is unreachable, or has no rows yet, every
 * project falls back to an empty gallery — the public card then shows its
 * existing "designs coming soon" state instead of breaking.
 */
export async function getCurrentWorkGalleries(): Promise<CurrentWorkGalleries> {
  const empty = emptyGalleries();
  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase
      .from("current_work_galleries")
      .select("project_key, gallery_images");

    if (error) {
      console.error(
        "getCurrentWorkGalleries: Supabase query failed, using empty fallback:",
        error.message,
      );
      return empty;
    }

    const result = emptyGalleries();
    for (const row of data ?? []) {
      const key = row.project_key as CurrentWorkKey;
      if (key in result) result[key] = (row.gallery_images as string[] | null) ?? [];
    }
    return result;
  } catch (error) {
    console.error("getCurrentWorkGalleries: unexpected error, using empty fallback:", error);
    return empty;
  }
}
