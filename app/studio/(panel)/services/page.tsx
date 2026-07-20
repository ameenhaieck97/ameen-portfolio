"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function ServicesPage() {
  return (
    <EntityManager
      table="services"
      title="Services"
      singular="service"
      description="Services offered — attach them to projects from the project editor."
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
