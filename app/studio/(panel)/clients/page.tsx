"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function ClientsPage() {
  return (
    <EntityManager
      table="testimonials"
      title="Clients"
      singular="client"
      description="Client quotes and reviews."
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
