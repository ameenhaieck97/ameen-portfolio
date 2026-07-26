import "server-only";
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
