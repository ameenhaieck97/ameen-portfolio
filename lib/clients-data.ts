import "server-only";
import { partners as staticPartners, type Partner } from "@/data/partners";
import { isSupabaseConfigured } from "./supabase/config";
import { getServerReadClient } from "./supabase/server-read";

type ClientRow = {
  id: string;
  name: string;
  name_ar: string | null;
  logo_url: string | null;
};

/**
 * The CMS is the source of truth: client/organization logos are read from
 * Supabase and mapped to the exact shape the Clients section renders. If
 * Supabase isn't configured, is unreachable, or has no seeded rows yet,
 * this falls back to the bundled static data so the site never regresses
 * or goes blank.
 */
export async function getClients(): Promise<Partner[]> {
  if (!isSupabaseConfigured()) return staticPartners;

  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, name_ar, logo_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getClients: Supabase query failed, using static fallback:", error.message);
      return staticPartners;
    }
    if (!data || data.length === 0) return staticPartners;

    return (data as ClientRow[]).map((row) => ({
      id: row.id,
      name: { en: row.name, ar: row.name_ar || row.name },
      logo: row.logo_url || undefined,
    }));
  } catch (error) {
    console.error("getClients: unexpected error, using static fallback:", error);
    return staticPartners;
  }
}
