"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function PackagesPage() {
  return (
    <EntityManager
      table="packages"
      title="Packages"
      singular="package"
      description="Pricing packages — publish one and feature it as the popup announcement in Settings → Promo popup."
      fields={[
        { key: "title", label: "Title", type: "text", required: true },
        { key: "title_ar", label: "Title (Arabic)", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "description_ar", label: "Description (Arabic)", type: "textarea" },
        { key: "price", label: "Price / label (e.g. $299)", type: "text" },
        { key: "price_ar", label: "Price / label (Arabic)", type: "text" },
        { key: "image_url", label: "Image", type: "image", folder: "packages" },
        { key: "link_url", label: "Link (optional)", type: "text" },
        { key: "published", label: "Published", type: "toggle" },
      ]}
    />
  );
}
