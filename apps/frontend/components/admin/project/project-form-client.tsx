"use client";

import { useSearchParams } from "next/navigation";
import ProjectForm from "@/components/admin/project/project-form";

export default function ProjectFormClient() {
  const searchParams = useSearchParams();
  const projectId = Number(searchParams.get("projectId"));

  return <ProjectForm projectId={projectId} />;
}