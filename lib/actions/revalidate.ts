"use server";

import { revalidatePath } from "next/cache";

/**
 * Clears the public homepage's cache immediately after a studio mutation,
 * instead of waiting for the ISR window. A Server Action needs no
 * client-exposed secret and runs directly on the server, so it can't
 * suffer the silent-failure modes a fetch-to-an-API-route approach can
 * (missing/stale NEXT_PUBLIC_ env var, network error, auth mismatch).
 */
export async function revalidatePublicSite() {
  revalidatePath("/en");
  revalidatePath("/ar");
}
