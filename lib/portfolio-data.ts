import "server-only";
import {
  portfolioItems,
  type PortfolioCategory,
  type PortfolioGroup,
  type PortfolioItem,
} from "@/data/portfolio";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";

// Only these groups render in the public Portfolio grid. "currentWork" items
// live in the Experience section and are intentionally excluded here.
const PUBLIC_GROUPS: PortfolioGroup[] = ["brandIdentity", "graphicDesign", "other"];

type ProjectRow = {
  id: string;
  title: string;
  title_ar: string | null;
  group_key: string | null;
  category_key: string | null;
  cover_image: string | null;
  preserve_color: boolean | null;
};

/**
 * The CMS is the source of truth: published projects are read from Supabase
 * and mapped to the exact shape the Portfolio section renders. If Supabase
 * isn't configured, is unreachable, or has no seeded rows yet, this falls
 * back to the bundled static data so the site never regresses or goes blank.
 */
export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) return portfolioItems;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, title_ar, group_key, category_key, cover_image, preserve_color")
      .eq("published", true)
      .in("group_key", PUBLIC_GROUPS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) return portfolioItems;

    return (data as ProjectRow[]).map((row) => ({
      id: row.id,
      category: (row.category_key || "brandIdentity") as PortfolioCategory,
      group: (row.group_key || "other") as PortfolioGroup,
      title: { en: row.title, ar: row.title_ar || row.title },
      image: row.cover_image || undefined,
      preserveColor: row.preserve_color || undefined,
    }));
  } catch {
    return portfolioItems;
  }
}
