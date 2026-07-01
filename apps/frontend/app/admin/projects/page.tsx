"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlusIcon, PlusIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResourcePageLayout } from "@/components/admin/resource-page-layout";
import { ResourceCard } from "@/components/admin/resource-card";
import { ProjectResponse, projectsApi } from "@/api/projects";
import { chatApi } from "@/api/chat";

export default function ProjectsAdminPage() {
  type ProjectStatus = "idle" | "processing" | "active";

  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectStatus, setProjectStatus] = useState<
    Record<number, ProjectStatus>
  >({});
  const [isProjectProcessing, setIsProjectProcessing] = useState(false);

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
    const project = await projectsApi.createProject({ label: "New Project" });
    router.push(`/admin/projects/${project.id}`);
  };

  const handleDelete = async (projectId: number) => {
    await projectsApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleRename = async (projectId: number, newLabel: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, label: newLabel } : p)),
    );
    await projectsApi.updateProject(projectId, { label: newLabel });
  };

  const handleEdit = (projectId: number) => {
    router.push(`/admin/projects/${projectId}`);
  };

  const handleApply = async (projectId: number) => {
    setIsProjectProcessing(true);
    setProjectStatus((prev) => ({
      ...prev,
      [projectId]: "processing",
    }));

    try {
      await chatApi.applyProject(projectId);

      setProjectStatus((prev) => ({
        ...prev,
        [projectId]: "active",
      }));
      window.open("/viewer", "_blank");
    } catch (e) {
      setProjectStatus((prev) => ({
        ...prev,
        [projectId]: "idle",
      }));
      toast.error("Failed to apply: configuration is incomplete.", {
        position: "top-center",
      });
    } finally {
      setIsProjectProcessing(false);
    }
  };

  return (
    <ResourcePageLayout
      title="Projects"
      resourceName="projects"
      itemsCount={projects.length}
      isLoading={isLoading}
      headerAction={
        <Button
          onClick={handleCreate}
          size="sm"
          className="gap-2 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" /> Create Project
        </Button>
      }
    >
      {projects.map((project) => {
        const status = projectStatus[project.id] ?? "idle";

        return (
          <ResourceCard
            key={project.id}
            icon={FolderPlusIcon}
            label={project.label}
            description=""
            onDelete={() => handleDelete(project.id)}
            onEdit={() => handleEdit(project.id)}
            onRename={(newLabel: string) => handleRename(project.id, newLabel)}
            extraButtons={
            [
              <Button key={1} onClick={() => projectsApi.exportProject(project.id)} variant="ghost">
                <Upload/>
              </Button>,
              <Button
                  key={2}
                  size="sm"
                  disabled={isProjectProcessing || status === "processing"}
                  onClick={() => handleApply(project.id)}
                  className={
                    status === "active"
                        ? "bg-green-600 hover:bg-green-600"
                        : status === "processing"
                            ? "opacity-60"
                            : ""
                  }
              >
                {status === "idle" && "Apply"}
                {status === "processing" && "Applying..."}
                {status === "active" && "Active"}
              </Button>
            ]
            }
          />
        );
      })}
    </ResourcePageLayout>
  );
}
