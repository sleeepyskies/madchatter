"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, BotIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentResponse, agentsApi } from "@madchatter/api/src/agents";
import { ResourcePageLayout } from "@/components/admin/resource-page-layout";
import { ResourceCard } from "@/components/admin/resource-card";

export default function AgentsAdminPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await agentsApi.listAgents();
        setAgents(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    const agent = await agentsApi.createAgent({
      label: "New Agent",
      systemPrompt: "",
      language: "en",
      voiceModel: ""
    });
    router.push(`/agents/${agent.id}`);
  };

  const handleDelete = async (id: number) => {
    await agentsApi.deleteAgent(id);
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
  };

  const handleRename = async (id: number, newLabel: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? {...agent, label: newLabel} : agent))
    );
    await agentsApi.updateAgent(id, {label: newLabel});
  };

  const handleEdit = (agentId: number) => {
    router.push(`/agents/${agentId}`)
  }

  return (
    <ResourcePageLayout
      title="Agents"
      resourceName="agents"
      itemsCount={agents.length}
      isLoading={isLoading}
      headerAction={
        <Button onClick={handleCreate} size="sm" className="gap-2 cursor-pointer">
          <PlusIcon className="w-4 h-4"/> Create Agent
        </Button>
      }
    >
      {agents.map((agent) => (
        <ResourceCard
          key={agent.id}
          icon={BotIcon}
          label={agent.label}
          description=""
          onDelete={() => handleDelete(agent.id)}
          onEdit={() => handleEdit(agent.id)}
          onRename={(newLabel) => handleRename(agent.id, newLabel)}
        />
      ))}
    </ResourcePageLayout>
  );
}
