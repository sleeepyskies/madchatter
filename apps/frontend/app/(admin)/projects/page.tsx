"use client";

import { useEffect, useState } from "react";
import { ProjectResponse, projectsApi } from "@madchatter/api/src/projects";
import { useRouter } from "next/navigation";
import { BotIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatApi } from "@madchatter/api/src/chat";
import { ResourcePageLayout } from '@/components/admin/resource-page-layout';
import { ResourceCard } from '@/components/admin/resource-card';

export default function Page() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await projectsApi.listProjects();
      setProjects(data);
    };
    fetchData();
  }, []);

  const handleDelete = async (projectId: number) => {
    await projectsApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleEdit = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };

  const handleRename = async (projectId: number, newLabel: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, label: newLabel } : p))
    );
    await projectsApi.updateProject(projectId, { label: newLabel });
  };

  return (
    <ResourcePageLayout
      title="All Projects"
      headerAction={
        <Button onClick={() => router.push("/project/create")} size="sm" className="gap-2 cursor-pointer">
          <PlusIcon className="w-4 h-4" /> Create Project
        </Button>
      }
    >
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <ResourceCard
            key={project.id}
            icon={BotIcon}
            label={project.label}
            description=""
            onDelete={() => handleDelete(project.id)}
            onEdit={() => handleEdit(project.id)}
            onRename={(newLabel: string) => handleRename(project.id, newLabel)}
            extraButtons={
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => chatApi.applyProject(project.id)}
              >
                Apply
              </Button>
            }
          />
        ))}
      </div>
    </ResourcePageLayout>
  );
}
