"use client";

import { MediaGrid } from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ivory">Media Library</h1>
      <p className="mt-1.5 text-sm text-ivory/55">
        Every uploaded image. Reuse them anywhere instead of uploading duplicates —
        copy a URL, or pick from the library inside any image field.
      </p>
      <div className="mt-6">
        <MediaGrid mode="manage" />
      </div>
    </div>
  );
}
