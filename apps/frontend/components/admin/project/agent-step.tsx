"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FilterableSelect } from "@/components/reusable/filterable-select";
import { AgentResponse, agentsApi } from "@/api/agents";
import { knowledgeApi, KnowledgeResponse } from "@/api/knowledge";
import { projectsApi } from "@/api/projects";

export function AgentStep({ projectId }: { projectId: number }) {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<{
    agentId: number | null;
    knowledgeId: number | null;
  }>({
    agentId: null,
    knowledgeId: null,
  });
  const [terms, setTerms] = useState("");

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
        setTerms(project.terms ?? "");
      } catch (err) {
        toast.error("Failed to load data.", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  const updateProjectConfig = async (
    newAgentId: number | null,
    newKnowledgeId: number | null,
  ) => {
    try {
      await projectsApi.updateProject(projectId, {
        agentId: newAgentId,
        knowledgeId: newKnowledgeId,
        terms,
      });
      setSelection({ agentId: newAgentId, knowledgeId: newKnowledgeId });
      toast.success("Configuration updated.", { position: "top-center" });
    } catch (err) {
      toast.error("Failed to save configuration.", { position: "top-center" });
    }
  };

  const updateTerms = async (newTerms: string) => {
    try {
      await projectsApi.updateProject(projectId, {
        terms: newTerms,
      });

      setTerms(newTerms);

      // toast.success("Configuration updated.", {
      //   position: "top-center",
      // });
    } catch {
      toast.error("Failed to save configuration.", {
        position: "top-center",
      });
    }
  };

  if (loading)
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Agent Configuration
        </h3>

        <div className="w-full rounded-xl border bg-muted/10 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              Agent
            </span>
            <div className="w-full sm:w-[280px]">
              <FilterableSelect
                value={selection.agentId}
                onChange={(id) =>
                  updateProjectConfig(id, selection.knowledgeId)
                }
                options={agents.map((a) => ({ id: a.id, label: a.label }))}
                placeholder="Select agent..."
                allowNull={false}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              Knowledge Base
            </span>
            <div className="w-full sm:w-[280px]">
              <FilterableSelect
                value={selection.knowledgeId}
                onChange={(id) => updateProjectConfig(selection.agentId, id)}
                options={knowledgeBases.map((kb) => ({
                  id: kb.id,
                  label: kb.label,
                }))}
                placeholder="Select Knowledge Base..."
                allowNull={true}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              Terms
            </span>

            <div className="w-full sm:w-[280px]">
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                onBlur={() => updateTerms(terms)}
                placeholder="Enter custom speech recognition terms..."
                className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
