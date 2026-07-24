"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { safeRevalidate } from "@/lib/revalidate";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { Skeleton } from "@/components/admin/Skeleton";
import { useToast } from "@/components/admin/Toast";

const PROJECTS = [
  { key: "institute", label: "Al-Mustafa Institute", note: "The hub card, shown at the center of the ecosystem." },
  { key: "mujeebCenter", label: "Al-Mujeeb Center", note: "" },
  { key: "najafPodcast", label: "Najaf Time Podcast", note: "" },
  { key: "iliaApp", label: "Ilia App", note: "" },
] as const;

type Galleries = Record<string, string[]>;

const EMPTY_GALLERIES: Galleries = { institute: [], mujeebCenter: [], najafPodcast: [], iliaApp: [] };

export default function CurrentWorkPage() {
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<Galleries | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await getSupabaseClient()
        .from("current_work_galleries")
        .select("project_key, gallery_images");
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setGalleries(EMPTY_GALLERIES);
        return;
      }
      const next: Galleries = { ...EMPTY_GALLERIES };
      for (const row of data ?? []) {
        next[row.project_key as string] = (row.gallery_images as string[] | null) ?? [];
      }
      setGalleries(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateGallery = async (key: string, next: string[]) => {
    const previous = galleries?.[key] ?? [];
    setGalleries((current) => (current ? { ...current, [key]: next } : current));
    const { error } = await getSupabaseClient()
      .from("current_work_galleries")
      .update({ gallery_images: next })
      .eq("project_key", key);
    if (error) {
      setGalleries((current) => (current ? { ...current, [key]: previous } : current));
      toast(error.message, "error");
      return;
    }
    toast("Gallery updated.");
    void safeRevalidate(toast);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-ivory">Current Work</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        Design uploads shown when a visitor clicks one of the four &quot;Currently&quot;
        ecosystem cards on the public site — each gets its own gallery, opened in the
        lightbox instead of &quot;Designs coming soon&quot;.
      </p>

      {loadError ? (
        <div className="glass mt-6 rounded-3xl border border-red-400/20 p-6 text-sm text-red-300">
          {loadError}
        </div>
      ) : null}

      {!galleries ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {PROJECTS.map((project) => (
            <section key={project.key} className="glass rounded-3xl p-6">
              <h2 className="font-display text-lg text-ivory">{project.label}</h2>
              {project.note ? (
                <p className="mt-1 text-xs text-ivory/45">{project.note}</p>
              ) : null}
              <div className="mt-5">
                <GalleryEditor
                  label="Gallery images"
                  folder="current-work"
                  value={galleries[project.key] ?? []}
                  onChange={(next) => void updateGallery(project.key, next)}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
