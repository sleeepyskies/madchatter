"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { agentsApi, AgentResponse } from "@madchatter/api/src/agents";
import { knowledgeApi, KnowledgeResponse } from "@madchatter/api/src/knowledge";
import { projectsApi } from "@madchatter/api/src/projects";
import { FilterableSelect } from "@/components/reusable/filterable-select";

export function AgentStep({ projectId }: { projectId: number }) {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<{ agentId: number | null, knowledgeId: number | null }>({
    agentId: null,
    knowledgeId: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [project, agentsList, kbList] = await Promise.all([
          projectsApi.getProject(projectId),
          agentsApi.listAgents(),
          knowledgeApi.listKnowledge(),
        ]);

        setAgents(agentsList);
        setKnowledgeBases(kbList);
        setSelection({
          agentId: project.agent?.id ?? null,
          knowledgeId: project.knowledgeId ?? null,
        });
      } catch (err) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const updateProjectConfig = async (newAgentId: number | null, newKnowledgeId: number | null) => {
    try {
      await projectsApi.updateProject(projectId, {
        agentId: newAgentId,
        knowledgeId: newKnowledgeId
      });
      setSelection({ agentId: newAgentId, knowledgeId: newKnowledgeId });
      toast.success("Configuration updated.");
    } catch (err) {
      toast.error("Failed to save configuration.");
    }
  };

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Agent Configuration</h3>

        <div className="w-full rounded-xl border bg-muted/10 p-4">
          <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-4">

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
                Agent
              </span>
              <div className="w-[200px]">
                <FilterableSelect
                  value={selection.agentId}
                  onChange={(id) => updateProjectConfig(id, selection.knowledgeId)}
                  options={agents.map(a => ({ id: a.id, label: a.label }))}
                  placeholder="Select agent..."
                  allowNull={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
                Knowledge Base
              </span>
              <div className="w-[200px]">
                <FilterableSelect
                  value={selection.knowledgeId}
                  onChange={(id) => updateProjectConfig(selection.agentId, id)}
                  options={knowledgeBases.map(kb => ({ id: kb.id, label: kb.label }))}
                  placeholder="Select Knowledge Base..."
                  allowNull={true}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
