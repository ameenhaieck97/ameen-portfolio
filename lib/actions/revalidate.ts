"use server";

import { revalidatePath } from "next/cache";

/**
 * Clears every public page's cache immediately after a studio mutation,
 * instead of waiting for the ISR window. A Server Action needs no
 * client-exposed secret and runs directly on the server, so it can't
 * suffer the silent-failure modes a fetch-to-an-API-route approach can
 * (missing/stale NEXT_PUBLIC_ env var, network error, auth mismatch).
 *
 * "layout" revalidates every route nested under each locale segment (home,
 * packages, offers, …) — settings that live in the shared layout (nav
 * visibility, maintenance mode, text scale) affect all of them, not just
 * the homepage itself.
 */
export async function revalidatePublicSite() {
  revalidatePath("/en", "layout");
  revalidatePath("/ar", "layout");
}
