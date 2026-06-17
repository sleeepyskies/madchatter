"use client";

import { useEffect, useState } from "react";
import { projectsApi, ProjectResponse } from "@madchatter/api/src/projects";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProjectCard } from "@/components/project-card";
export default function Page() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load project list on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await projectsApi.listProjects();
        setProjects(data);
      } catch (error) {
        console.log("Fetch Projects failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle project deletion
  const handleDelete = async (projectId: number) => {
    try {
      await projectsApi.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (error) {
      console.log("Delete failed:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader title="Projects" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
