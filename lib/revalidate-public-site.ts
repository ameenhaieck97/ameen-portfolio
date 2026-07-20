"use client";

/**
 * Fire-and-forget: tells the public site to drop its cache for the
 * homepage right now, instead of waiting for the ISR window. Called after
 * every studio mutation that could affect what visitors see. Never throws
 * — a failed revalidation shouldn't block the save the admin just made.
 */
export function revalidatePublicSite() {
  const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
  if (!secret) return;
  void fetch("/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
  }).catch(() => {
    // Cache will still clear on the next scheduled ISR pass.
  });
}
