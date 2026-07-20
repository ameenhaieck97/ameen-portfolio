import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Called by the studio after every content mutation so the public site
 * updates within seconds instead of waiting for the hourly ISR window.
 * Revalidation only clears a cache — it can't mutate or read private data —
 * so a shared secret is enough defense-in-depth; no session check needed.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/en");
  revalidatePath("/ar");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
