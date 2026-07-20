"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ImagePlus, Library, Loader2, Trash2, UploadCloud } from "lucide-react";
import { deleteImageByUrl, uploadImage } from "@/lib/supabase/storage";
import { useToast } from "./Toast";
import { FieldLabel } from "./FormControls";
import { MediaPicker } from "./MediaLibrary";
import { cn } from "@/lib/cn";

type UploadingItem = {
  id: string;
  name: string;
  percent: number;
};

/**
 * Drag & drop uploader for the `portfolio` Supabase Storage bucket.
 * `multiple` switches between single-image (cover/avatar) and gallery
 * behavior. Only public URLs leave this component — the database never
 * stores binary data.
 */
export function ImageUploader({
  label,
  folder,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  folder: string;
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const pickFromLibrary = (url: string) => {
    if (multiple) {
      if (!value.includes(url)) onChange([...value, url]);
    } else {
      onChange([url]);
    }
    toast("Image added from library.");
  };

  const startUploads = async (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) return;
    const batch = multiple ? images : images.slice(0, 1);

    const results = await Promise.all(
      batch.map(async (file) => {
        const id = crypto.randomUUID();
        setUploading((current) => [...current, { id, name: file.name, percent: 0 }]);
        try {
          const url = await uploadImage(file, folder, (percent) => {
            setUploading((current) =>
              current.map((item) => (item.id === id ? { ...item, percent } : item)),
            );
          });
          return url;
        } catch (error) {
          toast(
            error instanceof Error ? error.message : `Failed to upload ${file.name}`,
            "error",
          );
          return null;
        } finally {
          setUploading((current) => current.filter((item) => item.id !== id));
        }
      }),
    );

    const uploaded = results.filter((url): url is string => url !== null);
    if (uploaded.length === 0) return;
    onChange(multiple ? [...value, ...uploaded] : uploaded.slice(0, 1));
    toast(uploaded.length === 1 ? "Image uploaded." : `${uploaded.length} images uploaded.`);
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

  const showDropzone = multiple || (value.length === 0 && uploading.length === 0);

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      {value.length > 0 || uploading.length > 0 ? (
        <div
          className={cn(
            "mb-3 grid gap-3",
            multiple ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-1 max-w-60",
          )}
        >
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-canvas/60"
            >
              <Image
                src={url}
                alt=""
                fill
                unoptimized
                sizes="200px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="Delete image"
                disabled={deleting === url}
                onClick={() => void removeImage(url)}
                className="absolute end-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-red-300 opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
              >
                {deleting === url ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <Trash2 size={15} aria-hidden />
                )}
              </button>
            </div>
          ))}

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
              <span className="text-[11px] font-medium text-gold">{item.percent}%</span>
            </div>
          ))}
        </div>
      ) : null}

      {showDropzone ? (
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
          {dragging ? (
            <UploadCloud size={22} aria-hidden />
          ) : (
            <ImagePlus size={22} aria-hidden />
          )}
          <span>
            {dragging
              ? "Drop to upload"
              : multiple
                ? "Drag & drop images here, or click to browse"
                : "Drag & drop an image here, or click to browse"}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-gold transition-colors hover:text-gold-soft"
        >
          Replace image
        </button>
      )}

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
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          void startUploads(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={pickFromLibrary}
      />
    </div>
  );
}
