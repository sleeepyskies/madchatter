"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agentsApi, AgentResponse } from "@madchatter/api/src/agents";
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

  const handleDelete = async (id: number) => {
    try {
      await agentsApi.deleteAgent(id);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
    } catch (error) {
      console.error("Could not delete agent:", error);
    }
  };

  const handleRename = async (id: number, newLabel: string) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, label: newLabel } : agent))
    );
    await agentsApi.updateAgent(id, { label: newLabel });
  };

  return (
    <ResourcePageLayout
      title="Agents"
      resourceName="agents"
      itemsCount={agents.length}
      isLoading={isLoading}
      headerAction={
        <Button onClick={() => router.push("/agents/create")} size="sm" className="gap-2 cursor-pointer">
          <PlusIcon className="w-4 h-4" /> Create Agent
        </Button>
      }
    >
      {agents.map((agent) => (
        <ResourceCard
          key={agent.id}
          icon={UserCheckIcon}
          label={agent.label}
          description=""
          onDelete={() => handleDelete(agent.id)}
          onEdit={() => router.push(`/agents/${agent.id}`)}
          onRename={(newLabel) => handleRename(agent.id, newLabel)}
        />
      ))}
    </ResourcePageLayout>
  );
}
