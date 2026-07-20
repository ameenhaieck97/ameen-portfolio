"use client";

import { EMPTY_PROJECT_DRAFT, ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return <ProjectForm initialDraft={EMPTY_PROJECT_DRAFT} initialServiceIds={[]} />;
}
