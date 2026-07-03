"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlusIcon, PlusIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResourcePageLayout } from "@/components/admin/resource-page-layout";
import { ResourceCard } from "@/components/admin/resource-card";
import { ProjectResponse, projectsApi } from "@/api/projects";
import { chatApi } from "@/api/chat";

export default function ProjectsAdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [processingProjectId, setProcessingProjectId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectList, currentProject] = await Promise.all([
          projectsApi.listProjects(),
          chatApi.currentProject(),
        ]);

        setProjects(projectList);

        if (currentProject?.projectId) {
          setActiveProjectId(currentProject.projectId);
        }
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
    setProcessingProjectId(projectId);

    try {
      await chatApi.applyProject(projectId);

      setActiveProjectId(projectId);

      window.open("/viewer", "_blank");
    } catch (e) {
      toast.error("Failed to apply: configuration is incomplete.", {
        position: "top-center",
      });
    } finally {
      setProcessingProjectId(null);
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
        const isProcessing = processingProjectId === project.id;
        const isActive = activeProjectId === project.id;

        let status: "idle" | "processing" | "active" = "idle";

        if (isProcessing) status = "processing";
        else if (isActive) status = "active";

        return (
          <ResourceCard
            key={project.id}
            icon={FolderPlusIcon}
            label={project.label}
            description=""
            onDelete={() => handleDelete(project.id)}
            onEdit={() => handleEdit(project.id)}
            onRename={(newLabel: string) => handleRename(project.id, newLabel)}
            extraButtons={[
              <Button
                key="export"
                onClick={() => projectsApi.exportProject(project.id)}
                variant="ghost"
              >
                <Download />
              </Button>,

              <Button
                key="apply"
                size="sm"
                disabled={processingProjectId !== null}
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
              </Button>,
            ]}
          />
        );
      })}
    </ResourcePageLayout>
  );
}
