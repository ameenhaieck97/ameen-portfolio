"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { GripVertical, ImagePlus, Library, Loader2, Trash2, UploadCloud } from "lucide-react";
import { deleteImageByUrl, uploadImage } from "@/lib/supabase/storage";
import { useToast } from "./Toast";
import { FieldLabel } from "./FormControls";
import { MediaPicker } from "./MediaLibrary";
import { SortableGrid } from "./SortableGrid";
import { cn } from "@/lib/cn";

type UploadingItem = { id: string; name: string; percent: number };

/**
 * Gallery image manager: drag & drop upload, drag-to-reorder (no sort_order
 * numbers — the array order *is* the display order), remove, and add
 * existing images from the Media Library (single or multi-select).
 */
export function GalleryEditor({
  label,
  folder,
  value,
  onChange,
}: {
  label: string;
  folder: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const startUploads = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;

    const results = await Promise.all(
      images.map(async (file) => {
        const id = crypto.randomUUID();
        setUploading((current) => [...current, { id, name: file.name, percent: 0 }]);
        try {
          return await uploadImage(file, folder, (percent) => {
            setUploading((current) =>
              current.map((item) => (item.id === id ? { ...item, percent } : item)),
            );
          });
        } catch (error) {
          toast(error instanceof Error ? error.message : `Failed to upload ${file.name}`, "error");
          return null;
        } finally {
          setUploading((current) => current.filter((item) => item.id !== id));
        }
      }),
    );

    const uploaded = results.filter((url): url is string => url !== null);
    if (uploaded.length === 0) return;
    onChange([...value, ...uploaded]);
    toast(uploaded.length === 1 ? "Image added." : `${uploaded.length} images added.`);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void startUploads(Array.from(event.dataTransfer.files));
  };

  const removeImage = async (url: string) => {
    setDeleting(url);
    try {
      await deleteImageByUrl(url);
      onChange(value.filter((item) => item !== url));
      toast("Image removed.");
    } catch {
      toast("Could not delete the image from storage.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const items = value.map((url) => ({ id: url, url }));

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      {items.length > 0 || uploading.length > 0 ? (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <SortableGrid
            items={items}
            onReorder={(next) => onChange(next.map((item) => item.url))}
            className="contents"
            renderItem={(item) => (
              <div className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-canvas/60">
                <Image
                  src={item.url}
                  alt=""
                  fill
                  unoptimized
                  sizes="200px"
                  className="pointer-events-none object-cover"
                />
                <span className="absolute start-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-ivory/70 opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical size={14} aria-hidden />
                </span>
                <button
                  type="button"
                  aria-label="Remove image"
                  disabled={deleting === item.url}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    void removeImage(item.url);
                  }}
                  className="absolute end-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-red-300 opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
                >
                  {deleting === item.url ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden />
                  ) : (
                    <Trash2 size={13} aria-hidden />
                  )}
                </button>
              </div>
            )}
          />

          {uploading.map((item) => (
            <div
              key={item.id}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/40 bg-gold/5 p-3"
            >
              <Loader2 size={18} className="animate-spin text-gold" aria-hidden />
              <span className="w-full truncate text-center text-[11px] text-ivory/60">
                {item.name}
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-200"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-sm transition-colors",
          dragging
            ? "border-gold bg-gold/8 text-gold"
            : "border-white/15 text-ivory/55 hover:border-gold/40 hover:text-ivory/80",
        )}
      >
        {dragging ? <UploadCloud size={22} aria-hidden /> : <ImagePlus size={22} aria-hidden />}
        <span>{dragging ? "Drop to upload" : "Drag & drop images here, or click to browse"}</span>
      </button>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mt-2.5 inline-flex items-center gap-2 text-sm font-medium text-ivory/60 transition-colors hover:text-gold"
      >
        <Library size={15} aria-hidden />
        Choose from library
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void startUploads(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        onSelectMultiple={(urls) => {
          const additions = urls.filter((url) => !value.includes(url));
          if (additions.length === 0) return;
          onChange([...value, ...additions]);
          toast(
            additions.length === 1 ? "Image added." : `${additions.length} images added.`,
          );
        }}
      />
    </div>
  );
}
