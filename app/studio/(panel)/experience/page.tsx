"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function ExperiencePage() {
  return (
    <EntityManager
      table="experience"
      title="Experience"
      singular="experience entry"
      description="Career milestones for the timeline."
      fields={[
        { key: "company", label: "Company", type: "text", required: true },
        { key: "role", label: "Role", type: "text" },
        { key: "start_year", label: "Start year", type: "text" },
        { key: "end_year", label: "End year (empty = present)", type: "text", listHidden: true },
        { key: "description", label: "Description", type: "textarea", listHidden: true },
      ]}
    />
  );
}
