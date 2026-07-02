"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BotIcon,
  CirclePlusIcon,
  DatabaseIcon,
  FolderPlusIcon,
  LucideIcon,
  EyeIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { projectsApi } from "@/api/projects";
import { knowledgeApi } from "@/api/knowledge";
import { agentsApi } from "@/api/agents";

interface DashboardCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  onCreateNew: () => Promise<void>;
  onClickCard: () => void;
}

function DashboardCard({
  label,
  description,
  icon: Icon,
  onCreateNew,
  onClickCard,
}: DashboardCardProps) {
  return (
    <Card
      className="flex flex-col justify-between p-5 rounded-xl transition-all duration-300 hover:shadow-lg w-full"
    >
      <div>
        <CardHeader className="p-0 mt-2 space-y-1">
          <CardTitle
            className="flex items-center gap-2 font-semibold text-base text-neutral-900 dark:text-neutral-100">
            <Icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            <span>{label}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="p-0 mt-6 flex items-center gap-2 w-full">
        <Button
          onClick={onCreateNew}
          variant="default"
          className="flex-1 min-w-0 gap-1.5 cursor-pointer text-xs justify-center px-2"
        >
          <CirclePlusIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Create New</span>
        </Button>
        <Button
          onClick={onClickCard}
          variant="secondary"
          className="flex-1 min-w-0 gap-1.5 cursor-pointer text-xs justify-center px-2"
        >
          <span className="truncate">Manage</span>
          <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const createNewProject = async () => {
    const project = await projectsApi.createProject({ label: "New Project" });
    router.push(`/admin/projects/${project.id}`);
  };

  const createNewAgent = async () => {
    const agent = await agentsApi.createAgent({
      label: "New Agent",
      systemPrompt: "",
      language: "en",
      voiceModel: "nothing"
    });
    router.push(`/admin/agents/${agent.id}`);
  };

  const createNewKnowledgeBase = async () => {
    const knowledge = await knowledgeApi.createKnowledge({ label: "New Knowledge Base" });
    router.push(`/admin/knowledge-bases/${knowledge.id}`);
  };

  const actionCards = [
    {
      label: "Projects",
      description: "Piece together an agent, videos and a knowledge base.",
      icon: FolderPlusIcon,
      onCreateNew: createNewProject,
      onClickCard: () => router.push('/admin/projects'),
    },
    {
      label: "Agents",
      description: "Configure a custom persona.",
      icon: BotIcon,
      onCreateNew: createNewAgent,
      onClickCard: () => router.push('/admin/agents'),
    },
    {
      label: "Knowledge Bases",
      description: "Upload documents to create a custom knowledge base.",
      icon: DatabaseIcon,
      onCreateNew: createNewKnowledgeBase,
      onClickCard: () => router.push('/admin/knowledge-bases'),
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
        {actionCards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Card
          onClick={() => router.push("/viewer")}
          className="w-fit px-5 py-3 rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <EyeIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />

            <div className="flex flex-col leading-tight">
              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                Viewer
              </span>
              <span className="text-xs text-muted-foreground">
                Open the viewer with the applied project
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
