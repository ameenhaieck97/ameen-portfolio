import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Anonymous, session-less Supabase client for reading public data on the
 * server (RSC / build). The `public read` RLS policies only expose published
 * rows, so this never leaks drafts.
 */
export function getServerReadClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
