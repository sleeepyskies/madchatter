"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectResponse } from "@madchatter/api/src/projects";
import { HugeiconsIcon } from "@hugeicons/react";
import { BotIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/reusable/buttons/delete-button";
import { toast } from "sonner";
import { chatApi } from "@madchatter/api/src/chat";

interface ProjectCardProps {
  project: ProjectResponse;
  onDelete: (projectId: number) => Promise<void>;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleApply = async (projectId: number) => {
    try {
      setLoadingId(projectId);

      await chatApi.applyProject(projectId);
      toast.success("Project applied successfully.", {
        position: "top-center",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="group relative min-h-[192px] rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={BotIcon} className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg leading-none">
            {project.label}
          </h3>
        </div>

        <DeleteButton onConfirm={() => onDelete(project.id)} />
      </div>
      <div className="mt-4 bg-muted/30 p-3 rounded-lg border border-border/50 min-h-0 flex flex-col overflow-hidden">
        <p className="text-sm text-muted-foreground line-clamp-3 break-words">
          {project.agent?.systemPrompt}
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground cursor-pointer"
          onClick={() => router.push(`/project/${project.id}`)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            handleApply(project.id);
          }}
        >
          {loadingId === project.id ? "Applying..." : "Apply"}
        </Button>
      </div>
    </div>
  );
}
