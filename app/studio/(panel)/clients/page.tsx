"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function ClientsPage() {
  return (
    <EntityManager
      table="clients"
      title="Partner Logos"
      singular="logo"
      description="The logo slider shown on the public site — companies and organizations you've worked with."
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "name_ar", label: "Name (Arabic)", type: "text" },
        { key: "logo_url", label: "Logo", type: "image", folder: "clients" },
      ]}
    />
  );
}
