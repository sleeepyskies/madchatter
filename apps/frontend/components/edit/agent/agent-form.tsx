"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  agentsApi,
  AgentResponse,
  Language,
  UpdateAgentRequest
} from "@madchatter/api/src/agents";
import { EditResourceHeader } from "@/components/edit/edit-resource-header";
import { InlineEdit } from "@/components/reusable/inline-edit";
import { FilterableSelect } from "@/components/reusable/filterable-select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { debounce } from "next/dist/server/utils";

const VOICE_MODELS = [
  { id: 1, label: "alloy" },
  { id: 2, label: "echo" },
  { id: 3, label: "fable" },
];

const LANGUAGES: { id: number; label: Language }[] = [
  { id: 1, label: "en" },
  { id: 2, label: "de" },
];

export default function AgentForm({ agentId }: { agentId: number }) {
  const [agent, setAgent] = useState<AgentResponse | null>(null);
  const [promptDraft, setPromptDraft] = useState("");

  useEffect(() => {
    agentsApi.getAgent(agentId)
      .then((data) => {
        setAgent(data);
        setPromptDraft(data.systemPrompt);
      })
      .catch(() => toast.error("Failed to load agent"));
  }, [agentId]);

  const debouncedUpdate = useCallback(
    debounce(async (updates: UpdateAgentRequest) => {
      try {
        const updated = await agentsApi.updateAgent(agentId, updates);
        setAgent(updated);
      } catch {
        toast.error("Failed to sync changes");
      }
    }, 500),
    [agentId]
  );

  if (!agent) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditResourceHeader>
        <InlineEdit
          value={agent.label}
          onSave={(label) => debouncedUpdate({ label })}
        />
      </EditResourceHeader>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-2xl w-full mx-auto flex flex-col gap-8">
        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            value={promptDraft}
            onChange={(e) => {
              const val = e.target.value;
              setPromptDraft(val); // Instant UI update
              debouncedUpdate({ systemPrompt: val }); // Async sync
            }}
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Language</Label>
            <FilterableSelect
              value={LANGUAGES.find(l => l.label === agent.language)?.id ?? null}
              onChange={(id) => {
                const lang = LANGUAGES.find(l => l.id === id)?.label;
                if (lang) {
                  setAgent(prev => prev ? {...prev, language: lang} : null);
                  debouncedUpdate({ language: lang });
                }
              }}
              options={LANGUAGES}
              allowNull={false}
            />
          </div>

          <div className="space-y-2">
            <Label>Voice Model</Label>
            <FilterableSelect
              value={VOICE_MODELS.find(m => m.label === agent.voiceModel)?.id ?? null}
              onChange={(id) => {
                const model = VOICE_MODELS.find(m => m.id === id)?.label;
                if (model) {
                  setAgent(prev => prev ? {...prev, voiceModel: model} : null);
                  debouncedUpdate({ voiceModel: model });
                }
              }}
              options={VOICE_MODELS}
              allowNull={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
