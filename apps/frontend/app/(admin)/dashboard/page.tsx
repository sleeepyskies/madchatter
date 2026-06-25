"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BotIcon,
  CirclePlusIcon,
  DatabaseIcon,
  EyeIcon,
  FolderPlusIcon,
  Loader2Icon,
  LucideIcon,
} from "lucide-react";
import { projectsApi } from "@madchatter/api/src/projects";
import { knowledgeApi } from "@madchatter/api/src/knowledge";
import { agentsApi } from "@madchatter/api/src/agents";

export default function Page() {
  type Action = "project" | "agent" | "knowledge";

  interface ActionCard {
    action: Action;
    label: string;
    description: string;
    icon: LucideIcon;
    onCreateNew: () => Promise<void>;
  }

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createNewProject = async () => {
    try {
      setIsLoading(true);
      const project = await projectsApi.createProject({ label: "New Project" });
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewAgent = async () => {
    /*
    // TODO(sky): create an empty agent?
    const agent = await agentsApi.createAgent({ label: "New Agent" });
    router.push(`/agent/${agent.id}`);
    */
  };

  const createNewKnowledgeBase = async () => {
    const knowledge = await knowledgeApi.createKnowledge({label: "New Knowledge Base"});
    router.push(`/knowledge-base/${knowledge.id}`);
  };

  const actionCards: ActionCard[] = [
    {
      action: "project",
      label: "Projects",
      description: "Piece together an agent, videos and a knowledge base.",
      icon: FolderPlusIcon,
      onCreateNew: createNewProject,
      onClickCard: goToProjects,
    },
    {
      action: "agent",
      label: "Agents",
      description: "Configure a custom persona.",
      icon: BotIcon,
      onCreateNew: createNewAgent,
      onClickCard: goToAgents,
    },
    {
      action: "knowledge",
      label: "Knowledge Bases",
      description: "Upload documents to create a custom knowledge base.",
      icon: DatabaseIcon,
      onCreateNew: createNewKnowledgeBase,
      onClickCard: goToKnowledge,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-6xl mx-auto w-full pt-15">
      <div className="flex flex-col gap-1 border-b pb-6 dark:border-neutral-800">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          Create your customized AI agent quickly!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {actionCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.action}
              className="group relative flex flex-col justify-between p-6 bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div>
                <div className="flex justify-between items-start h-11">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl group-hover:bg-neutral-900 dark:group-hover:bg-neutral-50 group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                    <Icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-hover:text-inherit" />
                  </div>

                  {isLoading && (
                    <Loader2Icon className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                <div className="mt-5 space-y-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {card.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Action trigger button */}
              <Button
                onClick={card.onCreateNew}
                disabled={isLoading}
                variant="secondary"
                size="sm"
                className="mt-6 w-full gap-2 font-medium opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <CirclePlusIcon className="w-3.5 h-3.5" />
                {isLoading ? "Provisioning..." : "Create new"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t dark:border-neutral-800 pt-6">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <EyeIcon/>
          TODO(sky): Open Viewer
        </Button>
      </div>
    </div>
  );
}
