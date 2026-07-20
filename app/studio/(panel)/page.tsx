"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Clock,
  FolderKanban,
  Globe,
  HardDrive,
  ImageOff,
  Layers,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { listMediaLibrary } from "@/lib/supabase/storage";
import type { Project } from "@/types/admin";
import { Skeleton } from "@/components/admin/Skeleton";

type Stats = {
  total: number;
  published: number;
  categories: number;
};

type StorageStats = {
  count: number;
  bytes: number;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Project[] | null>(null);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void (async () => {
      const [total, published, categoriesCount, recentResult] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("published", true),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase
          .from("projects")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(6),
      ]);
      if (total.error) {
        setError(
          total.error.message.includes("does not exist") ||
            total.error.message.includes("schema cache")
            ? "Database tables not found — run the SQL migration in supabase/migrations via the Supabase SQL Editor."
            : total.error.message,
        );
        setStats({ total: 0, published: 0, categories: 0 });
        setRecent([]);
        return;
      }
      setStats({
        total: total.count ?? 0,
        published: published.count ?? 0,
        categories: categoriesCount.count ?? 0,
      });
      setRecent((recentResult.data ?? []) as Project[]);
    })();

    void listMediaLibrary()
      .then((items) =>
        setStorage({
          count: items.length,
          bytes: items.reduce((sum, item) => sum + item.size, 0),
        }),
      )
      .catch(() => setStorage({ count: 0, bytes: 0 }));
  }, []);

  const statCards = [
    { label: "Total Projects", value: stats?.total, icon: FolderKanban },
    { label: "Published Projects", value: stats?.published, icon: Globe },
    { label: "Categories", value: stats?.categories, icon: Layers },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
      <p className="mt-1.5 text-sm text-ivory/55">Overview of the portfolio content.</p>

      {error ? (
        <div className="glass mt-6 rounded-3xl border border-red-400/20 p-6 text-sm leading-relaxed text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="glass rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
              <Icon size={18} aria-hidden />
            </span>
            {value === undefined || stats === null ? (
              <Skeleton className="mt-5 h-10 w-16" />
            ) : (
              <p className="mt-5 font-display text-4xl text-ivory">{value}</p>
            )}
            <p className="mt-1.5 text-xs uppercase tracking-[0.15em] text-ivory/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Recent activity */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-ivory">Recent Activity</h2>
              <p className="mt-1 text-xs text-ivory/45">Most recently updated projects.</p>
            </div>
            <Link
              href="/studio/website/portfolio"
              className="inline-flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
            >
              View all
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          </div>

          <div className="mt-5">
            {recent === null ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="rounded-2xl border border-white/8 py-12 text-center text-sm text-ivory/55">
                No projects yet.{" "}
                <Link href="/studio/website/portfolio/new" className="font-medium text-gold hover:text-gold-soft">
                  Create the first one.
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {recent.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/studio/website/portfolio/${project.id}`}
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
                        <p className="truncate text-sm font-medium text-ivory">{project.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-ivory/45">
                          <Clock size={11} aria-hidden />
                          {timeAgo(project.updated_at)}
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

        {/* Storage usage */}
        <div className="glass rounded-3xl p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <HardDrive size={18} aria-hidden />
          </span>
          <h2 className="mt-5 font-display text-xl text-ivory">Storage Usage</h2>
          {storage === null ? (
            <Skeleton className="mt-4 h-9 w-24" />
          ) : (
            <p className="mt-4 font-display text-3xl text-ivory">{formatBytes(storage.bytes)}</p>
          )}
          <p className="mt-1.5 text-xs text-ivory/50">
            {storage === null ? "Loading…" : `${storage.count} image${storage.count === 1 ? "" : "s"} in the library`}
          </p>
          <Link
            href="/studio/media"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold transition-colors hover:text-gold-soft"
          >
            Open Media Library
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
