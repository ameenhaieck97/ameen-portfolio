"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./config";

let client: SupabaseClient | null = null;

/**
 * Browser-side Supabase client, shared across the whole admin panel.
 * Sessions are persisted in cookies (via @supabase/ssr) so the proxy can
 * read them when guarding /admin routes.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
