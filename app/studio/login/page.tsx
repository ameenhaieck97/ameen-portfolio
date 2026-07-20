"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : signInError.message,
        );
        setSubmitting(false);
        return;
      }
      // Full navigation so the proxy sees the fresh session cookie.
      window.location.assign("/studio");
    } catch {
      setError("Could not reach the authentication service.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="glass inline-flex h-14 w-14 items-center justify-center rounded-2xl text-gold">
            <Lock size={22} aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl text-ivory">Admin Panel</h1>
          <p className="mt-2 text-sm text-ivory/55">
            Sign in to manage the portfolio.
          </p>
        </div>

        {configured ? (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-6">
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-canvas/60 px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold/50"
            />

            <label htmlFor="password" className="mt-5 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-canvas/60 px-4 py-3 text-sm text-ivory outline-none transition-colors focus:border-gold/50"
            />

            {error ? (
              <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-canvas transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <div className="glass rounded-3xl p-6 text-sm leading-relaxed text-ivory/75">
            <p className="font-semibold text-gold">Supabase is not configured yet.</p>
            <ol className="mt-3 list-decimal space-y-2 ps-5">
              <li>
                Open <code className="text-ivory">.env.local</code> in the project root.
              </li>
              <li>
                Fill <code className="text-ivory">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="text-ivory">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from your
                Supabase dashboard (Project Settings → API).
              </li>
              <li>
                Run the SQL file in{" "}
                <code className="text-ivory">supabase/migrations</code> via the Supabase SQL
                Editor.
              </li>
              <li>Restart the dev server.</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
