"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  FileEdit,
  FolderKanban,
  Globe,
  ImageOff,
  Star,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Project } from "@/types/admin";
import { Skeleton } from "@/components/admin/Skeleton";

type Stats = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
};

const STAT_CARDS = [
  { key: "total", label: "Total Projects", icon: FolderKanban },
  { key: "published", label: "Published", icon: Globe },
  { key: "drafts", label: "Drafts", icon: FileEdit },
  { key: "featured", label: "Featured", icon: Star },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void (async () => {
      const [total, published, featured, recentResult] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("published", true),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("featured", true),
        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      if (total.error) {
        setError(
          total.error.message.includes("does not exist") ||
            total.error.message.includes("schema cache")
            ? "Database tables not found — run the SQL migration in supabase/migrations via the Supabase SQL Editor."
            : total.error.message,
        );
        setStats({ total: 0, published: 0, drafts: 0, featured: 0 });
        setRecent([]);
        return;
      }
      const totalCount = total.count ?? 0;
      const publishedCount = published.count ?? 0;
      setStats({
        total: totalCount,
        published: publishedCount,
        drafts: totalCount - publishedCount,
        featured: featured.count ?? 0,
      });
      setRecent((recentResult.data ?? []) as Project[]);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        Overview of the portfolio content.
      </p>

      {error ? (
        <div className="glass mt-6 rounded-3xl border border-red-400/20 p-6 text-sm leading-relaxed text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass rounded-3xl p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Icon size={17} aria-hidden />
            </span>
            {stats === null ? (
              <Skeleton className="mt-4 h-9 w-16" />
            ) : (
              <p className="mt-4 font-display text-4xl text-ivory">{stats[key]}</p>
            )}
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-ivory/50">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ivory">Recent Projects</h2>
          <Link
            href="/studio/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
          >
            View all
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>

        <div className="mt-4">
          {recent === null ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-sm text-ivory/55">
              No projects yet.{" "}
              <Link href="/studio/projects/new" className="font-medium text-gold hover:text-gold-soft">
                Create the first one.
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/studio/projects/${project.id}`}
                    className="glass-reveal flex items-center gap-4 rounded-2xl border border-white/8 px-5 py-3.5 transition-colors hover:border-gold/25"
                  >
                    <span className="relative h-11 w-11 flex-none overflow-hidden rounded-lg border border-white/10 bg-canvas/60">
                      {project.cover_image ? (
                        <Image
                          src={project.cover_image}
                          alt=""
                          fill
                          unoptimized
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-ivory/25">
                          <ImageOff size={15} aria-hidden />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ivory">
                        {project.title}
                      </p>
                      <p className="mt-0.5 text-xs text-ivory/45">
                        {new Date(project.created_at).toLocaleDateString("en-GB")}
                        {project.client ? ` · ${project.client}` : ""}
                      </p>
                    </div>
                    <span
                      className={
                        project.published
                          ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300"
                          : "rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-ivory/55"
                      }
                    >
                      {project.published ? "Published" : "Draft"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
