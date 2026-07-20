"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronDown, ImageOff, Loader2 } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { safeRevalidate } from "@/lib/revalidate";
import type { Category, Project, Service } from "@/types/admin";
import { ImageUploader } from "./ImageUploader";
import { GalleryEditor } from "./GalleryEditor";
import {
  SelectField,
  TagInput,
  TextAreaField,
  TextField,
  Toggle,
} from "./FormControls";
import { useToast } from "./Toast";
import { cn } from "@/lib/cn";

export type ProjectDraft = {
  title: string;
  title_ar: string;
  slug: string;
  short_description: string;
  short_description_ar: string;
  full_description: string;
  full_description_ar: string;
  client: string;
  year: string;
  category_id: string;
  group_key: string;
  category_key: string;
  preserve_color: boolean;
  technologies: string[];
  featured: boolean;
  published: boolean;
  cover_image: string;
  gallery_images: string[];
  sort_order: string;
};

export const GROUP_OPTIONS = [
  { value: "brandIdentity", label: "Brand Identity" },
  { value: "graphicDesign", label: "Graphic Design" },
  { value: "other", label: "Other" },
  { value: "currentWork", label: "Current Work (Experience section)" },
] as const;

// Category label keys the public portfolio card uses for its small eyebrow.
export const CATEGORY_KEY_OPTIONS = [
  { value: "brandIdentity", label: "Brand Identity" },
  { value: "logoDesign", label: "Logo Design" },
  { value: "print", label: "Print Production" },
  { value: "restoration", label: "Photo Restoration" },
  { value: "colorization", label: "Colorization" },
] as const;

export const EMPTY_PROJECT_DRAFT: ProjectDraft = {
  title: "",
  title_ar: "",
  slug: "",
  short_description: "",
  short_description_ar: "",
  full_description: "",
  full_description_ar: "",
  client: "",
  year: "",
  category_id: "",
  group_key: "brandIdentity",
  category_key: "brandIdentity",
  preserve_color: false,
  technologies: [],
  featured: false,
  published: false,
  cover_image: "",
  gallery_images: [],
  sort_order: "0",
};

export function projectToDraft(project: Project): ProjectDraft {
  return {
    title: project.title,
    title_ar: project.title_ar ?? "",
    slug: project.slug,
    short_description: project.short_description,
    short_description_ar: project.short_description_ar ?? "",
    full_description: project.full_description,
    full_description_ar: project.full_description_ar ?? "",
    client: project.client,
    year: project.year === null ? "" : String(project.year),
    category_id: project.category_id ?? "",
    group_key: project.group_key ?? "brandIdentity",
    category_key: project.category_key ?? "brandIdentity",
    preserve_color: project.preserve_color ?? false,
    technologies: project.technologies,
    featured: project.featured,
    published: project.published,
    cover_image: project.cover_image,
    gallery_images: project.gallery_images,
    sort_order: String(project.sort_order),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mirrors the real public-site PortfolioCard's visual language (same
 * gradient, eyebrow + title + pill treatment) so the "live preview" is
 * genuinely representative — not a mock — while staying free of that
 * component's next-intl/PortfolioItem coupling, which the studio doesn't
 * have wired up.
 */
function LivePreviewCard({
  coverImage,
  title,
  categoryLabel,
  client,
}: {
  coverImage: string;
  title: string;
  categoryLabel: string;
  client: string;
}) {
  return (
    <div className="group relative flex aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] border border-white/8 bg-canvas-raised">
      <div className="absolute inset-0">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            unoptimized
            sizes="420px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ivory/20">
            <ImageOff size={32} aria-hidden />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-7">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {categoryLabel || "Category"}
          </p>
          <p className="mt-1 font-display text-xl leading-snug text-ivory">
            {title.trim() || "Untitled project"}
          </p>
          {client.trim() ? (
            <p className="mt-1 text-sm text-ivory/55">{client}</p>
          ) : null}
        </div>
        <span className="glass inline-flex h-10 flex-none items-center gap-1.5 rounded-full px-4 text-xs font-medium uppercase tracking-[0.1em] text-ivory">
          View project
          <ArrowUpRight size={14} aria-hidden />
        </span>
      </div>
    </div>
  );
}

function LangTabs({
  lang,
  onChange,
}: {
  lang: "en" | "ar";
  onChange: (next: "en" | "ar") => void;
}) {
  return (
    <div className="inline-flex flex-none rounded-full border border-white/10 bg-canvas/40 p-1">
      {(["en", "ar"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "h-8 rounded-full px-4 text-xs font-medium transition-colors",
            lang === option ? "bg-gold text-canvas" : "text-ivory/55 hover:text-ivory",
          )}
        >
          {option === "en" ? "English" : "العربية"}
        </button>
      ))}
    </div>
  );
}

export function ProjectForm({
  projectId,
  initialDraft,
  initialServiceIds,
}: {
  /** Present when editing, absent when creating */
  projectId?: string;
  initialDraft: ProjectDraft;
  initialServiceIds: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState<ProjectDraft>(initialDraft);
  const [serviceIds, setServiceIds] = useState<string[]>(initialServiceIds);
  const [slugTouched, setSlugTouched] = useState(Boolean(projectId));
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
    void supabase
      .from("services")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setServices((data ?? []) as Service[]));
  }, []);

  const set = <Key extends keyof ProjectDraft>(key: Key, value: ProjectDraft[Key]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const effectiveSlug = useMemo(
    () => (slugTouched ? draft.slug : slugify(draft.title)),
    [slugTouched, draft.slug, draft.title],
  );

  const categoryLabel = useMemo(() => {
    const category = categories.find((item) => item.id === draft.category_id);
    if (category) return category.name;
    return CATEGORY_KEY_OPTIONS.find((option) => option.value === draft.category_key)?.label ?? "";
  }, [categories, draft.category_id, draft.category_key]);

  const save = async () => {
    if (draft.title.trim() === "") {
      toast("Title is required.", "error");
      return;
    }
    const slug = slugify(slugTouched ? draft.slug : draft.title);
    if (slug === "") {
      toast("Slug is required.", "error");
      return;
    }

    setSaving(true);
    const supabase = getSupabaseClient();
    const payload = {
      title: draft.title.trim(),
      title_ar: draft.title_ar.trim(),
      slug,
      short_description: draft.short_description,
      short_description_ar: draft.short_description_ar,
      full_description: draft.full_description,
      full_description_ar: draft.full_description_ar,
      client: draft.client,
      year: draft.year.trim() === "" ? null : Number(draft.year),
      category_id: draft.category_id === "" ? null : draft.category_id,
      group_key: draft.group_key,
      category_key: draft.category_key,
      preserve_color: draft.preserve_color,
      technologies: draft.technologies,
      featured: draft.featured,
      published: draft.published,
      cover_image: draft.cover_image,
      gallery_images: draft.gallery_images,
      sort_order: Number(draft.sort_order) || 0,
    };

    let id = projectId;
    if (id) {
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) {
        setSaving(false);
        toast(error.message.includes("duplicate") ? "That slug is already in use." : error.message, "error");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        setSaving(false);
        toast(
          error?.message.includes("duplicate") ? "That slug is already in use." : (error?.message ?? "Could not create the project."),
          "error",
        );
        return;
      }
      id = data.id as string;
    }

    // Sync the services join table to exactly the selected set.
    const { error: clearError } = await supabase
      .from("project_services")
      .delete()
      .eq("project_id", id);
    const { error: linkError } =
      serviceIds.length > 0
        ? await supabase
            .from("project_services")
            .insert(serviceIds.map((service_id) => ({ project_id: id, service_id })))
        : { error: null };
    setSaving(false);

    if (clearError || linkError) {
      toast("Project saved, but linking services failed.", "error");
    } else {
      toast(projectId ? "Project updated." : "Project created.");
    }
    void safeRevalidate(toast);
    router.push("/studio/website/portfolio");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/studio/website/portfolio"
          className="inline-flex items-center gap-2 text-sm text-ivory/55 transition-colors hover:text-gold"
        >
          <ArrowLeft size={15} aria-hidden />
          Back to projects
        </Link>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-canvas transition-colors hover:bg-gold-soft disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          {projectId ? "Save changes" : "Create project"}
        </button>
      </div>

      <h1 className="mt-4 font-display text-3xl text-ivory">
        {projectId ? "Edit Project" : "New Project"}
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* Live preview column */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-ivory/50">
              Live preview
            </p>
            <LivePreviewCard
              coverImage={draft.cover_image}
              title={lang === "en" ? draft.title : draft.title_ar}
              categoryLabel={categoryLabel}
              client={draft.client}
            />
            <a
              href="/en#portfolio"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ivory/55 transition-colors hover:text-gold"
            >
              View public site
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>

          <div className="glass space-y-3 rounded-2xl p-4">
            <Toggle
              label="Published"
              description="Visible to the public"
              checked={draft.published}
              onChange={(next) => set("published", next)}
            />
            <Toggle
              label="Featured"
              description="Highlight this project"
              checked={draft.featured}
              onChange={(next) => set("featured", next)}
            />
          </div>
        </div>

        {/* Fields column */}
        <div className="space-y-6">
          <section className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-lg text-ivory">Project</h2>
              <LangTabs lang={lang} onChange={setLang} />
            </div>
            <div className="mt-5 space-y-5">
              <ImageUploader
                label="Project image"
                folder="projects/covers"
                value={draft.cover_image ? [draft.cover_image] : []}
                onChange={(urls) => set("cover_image", urls[0] ?? "")}
              />

              {lang === "en" ? (
                <TextField
                  label="Title"
                  required
                  value={draft.title}
                  onChange={(event) => set("title", event.target.value)}
                />
              ) : (
                <TextField
                  label="Title (Arabic)"
                  dir="rtl"
                  value={draft.title_ar}
                  onChange={(event) => set("title_ar", event.target.value)}
                />
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Client"
                  value={draft.client}
                  onChange={(event) => set("client", event.target.value)}
                />
                <SelectField
                  label="Category"
                  value={draft.category_id}
                  onChange={(event) => set("category_id", event.target.value)}
                >
                  <option value="">— None —</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </SelectField>
              </div>

              {lang === "en" ? (
                <TextAreaField
                  label="Short description"
                  rows={3}
                  value={draft.short_description}
                  onChange={(event) => set("short_description", event.target.value)}
                />
              ) : (
                <TextAreaField
                  label="Short description (Arabic)"
                  dir="rtl"
                  rows={3}
                  value={draft.short_description_ar}
                  onChange={(event) => set("short_description_ar", event.target.value)}
                />
              )}
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Gallery</h2>
            <p className="mt-1 text-sm text-ivory/50">
              Drag images to reorder — the order here is the display order.
            </p>
            <div className="mt-5">
              <GalleryEditor
                label="Gallery images"
                folder="projects/gallery"
                value={draft.gallery_images}
                onChange={(next) => set("gallery_images", next)}
              />
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg text-ivory">Services &amp; technologies</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-ivory/60">
                  Services
                </p>
                {services.length === 0 ? (
                  <p className="text-sm text-ivory/45">
                    No services defined yet — add them in the Services module.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => {
                      const selected = serviceIds.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setServiceIds((current) =>
                              selected
                                ? current.filter((id) => id !== service.id)
                                : [...current, service.id],
                            )
                          }
                          className={cn(
                            "h-10 rounded-full border px-4 text-sm transition-colors",
                            selected
                              ? "border-gold/60 bg-gold/12 text-gold"
                              : "border-white/10 text-ivory/65 hover:border-white/25",
                          )}
                        >
                          {service.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <TagInput
                label="Technologies"
                value={draft.technologies}
                onChange={(next) => set("technologies", next)}
                placeholder="Type and press Enter — e.g. Photoshop, Illustrator"
              />
            </div>
          </section>

          <section className="glass overflow-hidden rounded-3xl">
            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-4 p-6 text-start"
            >
              <div>
                <h2 className="font-display text-lg text-ivory">Advanced</h2>
                <p className="mt-1 text-xs text-ivory/50">
                  Slug, sort order, classification — most projects don&apos;t need these.
                </p>
              </div>
              <ChevronDown
                size={18}
                aria-hidden
                className={cn(
                  "flex-none text-ivory/50 transition-transform duration-300",
                  advancedOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {advancedOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-5 border-t border-white/8 p-6 sm:grid-cols-2">
                    <TextField
                      label="Slug"
                      required
                      value={effectiveSlug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        set("slug", event.target.value);
                      }}
                    />
                    <TextField
                      label="Year"
                      type="number"
                      placeholder="2026"
                      value={draft.year}
                      onChange={(event) => set("year", event.target.value)}
                    />
                    <SelectField
                      label="Portfolio group"
                      value={draft.group_key}
                      onChange={(event) => set("group_key", event.target.value)}
                    >
                      {GROUP_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>
                    <SelectField
                      label="Card label"
                      value={draft.category_key}
                      onChange={(event) => set("category_key", event.target.value)}
                    >
                      {CATEGORY_KEY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </SelectField>
                    <TextField
                      label="Sort order"
                      type="number"
                      value={draft.sort_order}
                      onChange={(event) => set("sort_order", event.target.value)}
                    />
                    <Toggle
                      label="Preserve logo colors"
                      description="Keep an SVG logo's original colors instead of the gold mono-mask"
                      checked={draft.preserve_color}
                      onChange={(next) => set("preserve_color", next)}
                    />
                    {lang === "en" ? (
                      <TextAreaField
                        label="Full description"
                        rows={5}
                        className="sm:col-span-2"
                        value={draft.full_description}
                        onChange={(event) => set("full_description", event.target.value)}
                      />
                    ) : (
                      <TextAreaField
                        label="Full description (Arabic)"
                        dir="rtl"
                        rows={5}
                        className="sm:col-span-2"
                        value={draft.full_description_ar}
                        onChange={(event) => set("full_description_ar", event.target.value)}
                      />
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
