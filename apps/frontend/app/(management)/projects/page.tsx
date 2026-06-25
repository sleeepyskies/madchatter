"use client";

import { useEffect, useState } from "react";
import { ProjectResponse, projectsApi } from "@madchatter/api/src/projects";
import { useRouter } from "next/navigation";
import { BotIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatApi } from "@madchatter/api/src/chat";
import { ResourcePageLayout } from '@/components/admin/resource-page-layout';
import { ResourceCard } from '@/components/admin/resource-card';

export default function ProjectsAdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await projectsApi.listProjects();
        setProjects(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    const project = await projectsApi.createProject({label: "New Project"});
    router.push(`/projects/${project.id}`);
  }

  const handleDelete = async (projectId: number) => {
    await projectsApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleRename = async (projectId: number, newLabel: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? {...p, label: newLabel} : p))
    );
    await projectsApi.updateProject(projectId, {label: newLabel});
  };

  const handleEdit = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <ResourcePageLayout
      title="Projects"
      resourceName="projects"
      itemsCount={projects.length}
      isLoading={isLoading}
      headerAction={
        <Button onClick={handleCreate} size="sm" className="gap-2 cursor-pointer">
          <PlusIcon className="w-4 h-4"/> Create Project
        </Button>
      }
    >
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
    </ResourcePageLayout>
  );
}
