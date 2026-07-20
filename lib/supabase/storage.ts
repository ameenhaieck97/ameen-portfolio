"use client";

import { getSupabaseClient } from "./client";
import { supabaseAnonKey, supabaseUrl } from "./config";

const BUCKET = "portfolio";

/** Raster formats worth recompressing; svg/gif pass through untouched. */
const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION = 2200;
const COMPRESS_THRESHOLD_BYTES = 600 * 1024;

async function compressImage(file: File): Promise<Blob> {
  if (!COMPRESSIBLE.includes(file.type)) return file;

  const needsCompression = file.size > COMPRESS_THRESHOLD_BYTES;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (!needsCompression && scale === 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85),
  );
  // Keep the original if compression somehow produced a bigger file.
  return blob && blob.size < file.size ? blob : file;
}

function extensionFor(blob: Blob, original: File) {
  if (blob.type === "image/webp") return "webp";
  const fromName = original.name.split(".").pop()?.toLowerCase();
  return fromName && fromName.length <= 5 ? fromName : "bin";
}

export function publicUrlToPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

/**
 * Uploads one image to the `portfolio` bucket and resolves to its public
 * URL. Uses XHR (rather than the SDK) so real upload progress can be
 * reported; large rasters are downscaled/recompressed to webp first.
 */
export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const blob = await compressImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${extensionFor(blob, file)}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Content-Type", blob.type || "application/octet-stream");
    xhr.setRequestHeader("Cache-Control", "max-age=31536000");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed (network error)"));
    xhr.send(blob);
  });

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Deletes a previously uploaded image, given its public URL. */
export async function deleteImageByUrl(url: string): Promise<void> {
  const path = publicUrlToPath(url);
  if (!path) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export type MediaItem = {
  path: string;
  name: string;
  url: string;
  size: number;
  updatedAt: string;
};

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

/**
 * Walks the whole `portfolio` bucket (root + nested folders) and returns
 * every image as a reusable media item. Supabase's list() is non-recursive
 * — a null `id` marks a folder — so we recurse into each prefix.
 */
export async function listMediaLibrary(): Promise<MediaItem[]> {
  const supabase = getSupabaseClient();
  const items: MediaItem[] = [];

  const walk = async (prefix: string, depth: number) => {
    if (depth > 4) return;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });
    if (error || !data) return;

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        await walk(path, depth + 1);
        continue;
      }
      if (!IMAGE_EXT.test(entry.name)) continue;
      items.push({
        path,
        name: entry.name,
        url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURI(path)}`,
        size: (entry.metadata?.size as number | undefined) ?? 0,
        updatedAt:
          (entry.updated_at as string | undefined) ??
          (entry.created_at as string | undefined) ??
          "",
      });
    }
  };

  await walk("", 0);
  return items;
}

/** Deletes a media item by its storage path. */
export async function deleteMediaByPath(path: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
