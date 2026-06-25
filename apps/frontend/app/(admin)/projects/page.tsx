"use client";

import {useEffect, useState} from "react";
import {ProjectResponse, projectsApi} from "@madchatter/api/src/projects";
import { useAdminHeader } from "@/providers/admin-header-provider";
import { ResourceCard } from '@/components/reusable/resource-card';
import { useRouter } from 'next/navigation';
import { BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatApi } from '@madchatter/api/src/chat';

export default function Page() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const { setTitle } = useAdminHeader();

  useEffect(() => {
    setTitle("Projects");
  }, []);

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
    router.push(`/project/${projectId}`)
  }

  const handleRename = async (projectId: number, newLabel: string) => {
    await projectsApi.updateProject(projectId, { label: newLabel });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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

    </div>
  );
}
