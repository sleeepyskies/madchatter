"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FilterableSelect } from "@/components/reusable/filterable-select";
import { AgentResponse, agentsApi } from "@/api/agents";
import { knowledgeApi, KnowledgeResponse } from "@/api/knowledge";
import { projectsApi, STTModel, STTDevice } from "@/api/projects";

const STTMODEL: { id: number; label: STTModel }[] = [
  { id: 1, label: "base" },
  { id: 2, label: "small" },
  { id: 3, label: "medium" },
  { id: 4, label: "large-v2" },
  { id: 5, label: "large-v3" },
];

const STTDEVICE: { id: number; label: STTDevice }[] = [
  { id: 1, label: "cpu" },
  { id: 2, label: "cuda" },
];

export function AgentStep({ projectId }: { projectId: number }) {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<{
    agentId: number | null;
    knowledgeId: number | null;
    sttModel: STTModel | null;
    sttDevice: STTDevice | null;
  }>({
    agentId: null,
    knowledgeId: null,
    sttModel: null,
    sttDevice: null,
  });

  const [terms, setTerms] = useState("");
  const [llmModel, setLlmModel] = useState("llama3.2");

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
          sttModel: project.sttModel ?? "small",
          sttDevice: project.sttDevice ?? "cpu",
        });
        setTerms(project.sttTerms ?? "");
        setLlmModel(project.llmModel ?? "");
      } catch (err) {
        toast.error("Failed to load data.", { position: "top-center" });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  const updateProjectConfig = async (newSelection: typeof selection) => {
    try {
      await projectsApi.updateProject(projectId, {
        agentId: newSelection.agentId,
        knowledgeId: newSelection.knowledgeId,
        sttModel: newSelection.sttModel,
        sttDevice: newSelection.sttDevice,
      });
      setSelection(newSelection);
      toast.success("Configuration updated.", { position: "top-center" });
    } catch (err) {
      toast.error("Failed to save configuration.", { position: "top-center" });
    }
  };

  const updateTerms = async (newTerms: string) => {
    try {
      await projectsApi.updateProject(projectId, {
        sttTerms: newTerms,
      });

      setTerms(newTerms);
    } catch {
      toast.error("Failed to save configuration.", {
        position: "top-center",
      });
    }
  };

  const updateLlmModel = async (newLlmModel: string) => {
    try {
      await projectsApi.updateProject(projectId, {
        llmModel: newLlmModel,
      });

      setLlmModel(newLlmModel);
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
                  updateProjectConfig({ ...selection, agentId: id })
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
                onChange={(id) =>
                  updateProjectConfig({ ...selection, knowledgeId: id })
                }
                options={knowledgeBases.map((kb) => ({
                  id: kb.id,
                  label: kb.label,
                }))}
                placeholder="Select Knowledge Base..."
                allowNull={true}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              STT Model
            </span>

            <div className="w-full sm:w-[280px]">
              <FilterableSelect
                value={
                  STTMODEL.find((m) => m.label === selection.sttModel)?.id ??
                  null
                }
                onChange={(id) => {
                  const model =
                    STTMODEL.find((m) => m.id === id)?.label ?? null;

                  updateProjectConfig({ ...selection, sttModel: model });
                }}
                options={STTMODEL}
                placeholder="Select STT model..."
                allowNull={false}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              STT Device
            </span>

            <div className="w-full sm:w-[280px]">
              <FilterableSelect
                value={
                  STTDEVICE.find((d) => d.label === selection.sttDevice)?.id ??
                  null
                }
                onChange={(id) => {
                  const device =
                    STTDEVICE.find((d) => d.id === id)?.label ?? null;

                  updateProjectConfig({ ...selection, sttDevice: device });
                }}
                options={STTDEVICE}
                placeholder="Select STT device..."
                allowNull={false}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              STT Terms
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

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-foreground tracking-tight w-[140px]">
              LLM Model
            </span>

            <div className="w-full sm:w-[280px]">
              <input
                type="text"
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                onBlur={() => updateLlmModel(llmModel)}
                placeholder="e.g. llama3.2"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
