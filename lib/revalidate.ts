"use client";

import { revalidatePublicSite } from "@/lib/actions/revalidate";

/**
 * Wraps the revalidate Server Action with visible failure feedback — call
 * right after a successful studio mutation. Unlike the previous fetch-based
 * approach, a failure here is a real, surfaced error rather than a silent
 * no-op, since Server Actions throw normally instead of needing a manual
 * secret/fetch/catch dance.
 */
export async function safeRevalidate(toast: (message: string, kind?: "success" | "error") => void) {
  try {
    await revalidatePublicSite();
  } catch {
    toast("Saved, but the public site refresh failed — it may take a moment to update.", "error");
  }
}
