"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function CategoriesPage() {
  return (
    <EntityManager
      table="categories"
      title="Categories"
      singular="category"
      description="Project categories shown across the portfolio."
      fields={[
        { key: "name", label: "Name (English)", type: "text", required: true },
        { key: "name_ar", label: "Name (Arabic)", type: "text", listHidden: true },
        { key: "slug", label: "Slug", type: "text", required: true },
      ]}
    />
  );
}
