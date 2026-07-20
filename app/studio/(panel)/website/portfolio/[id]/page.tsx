"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Project } from "@/types/admin";
import {
  ProjectForm,
  projectToDraft,
  type ProjectDraft,
} from "@/components/admin/ProjectForm";
import { Skeleton } from "@/components/admin/Skeleton";

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; draft: ProjectDraft; serviceIds: string[] };

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const supabase = getSupabaseClient();
    void (async () => {
      const [projectResult, linksResult] = await Promise.all([
        supabase.from("projects").select("*").eq("id", params.id).maybeSingle(),
        supabase.from("project_services").select("service_id").eq("project_id", params.id),
      ]);
      if (projectResult.error || !projectResult.data) {
        setState({ status: "missing" });
        return;
      }
      setState({
        status: "ready",
        draft: projectToDraft(projectResult.data as Project),
        serviceIds: (linksResult.data ?? []).map(
          (row) => row.service_id as string,
        ),
      });
    })();
  }, [params.id]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (state.status === "missing") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-sm text-ivory/60">This project no longer exists.</p>
          <Link
            href="/studio/website/portfolio"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-soft"
          >
            <ArrowLeft size={15} aria-hidden />
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProjectForm
      projectId={params.id}
      initialDraft={state.draft}
      initialServiceIds={state.serviceIds}
    />
  );
}
