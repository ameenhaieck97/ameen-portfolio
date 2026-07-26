import "server-only";

/**
 * Bounds how long a server-side Supabase call can block page rendering.
 * AbortSignal-based timeouts (passed into the client's fetch) don't
 * reliably cut a hung DNS/connect phase short — the promise this wraps can
 * keep dangling in the background, but the caller moves on the instant the
 * timeout fires, so a slow/unreachable Supabase project degrades to the
 * static fallback quickly instead of stalling the whole page (and, for the
 * homepage, every locale-switch navigation, since that's a fresh render).
 */
export function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
