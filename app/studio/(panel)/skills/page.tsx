"use client";

import { EntityManager } from "@/components/admin/EntityManager";

export default function SkillsPage() {
  return (
    <EntityManager
      table="skills"
      title="Skills"
      singular="skill"
      description="Skills listed on the public site."
      fields={[{ key: "name", label: "Name", type: "text", required: true }]}
    />
  );
}
