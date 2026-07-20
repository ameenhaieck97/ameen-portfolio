"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function TestimonialsPage() {
  return (
    <EntityManager
      table="testimonials"
      title="Testimonials"
      singular="testimonial"
      description="Client quotes — only published ones are visible to visitors."
      fields={[
        { key: "author", label: "Author", type: "text", required: true },
        { key: "role", label: "Role / Company", type: "text" },
        { key: "quote", label: "Quote", type: "textarea", required: true, listHidden: true },
        { key: "published", label: "Published", type: "toggle" },
        { key: "avatar_url", label: "Avatar", type: "image", folder: "testimonials", listHidden: true },
      ]}
    />
  );
}
