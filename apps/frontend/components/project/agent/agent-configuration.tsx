/**
 * UI component for managing agent.
 * Notice: agent related service operations are included in project-service component.
 */
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeBaseStep } from "@/components/project/agent/knowledge-base";
import { VoiceSetting } from "./voice-setting";
import { VideoSetting } from "./video-setting";
import { VideoDraft } from "@/components/project/video/video-upload";
import { VideoAssignments } from "@/components/project/agent/video-setting";

export interface AgentDraft {
  id?: number;
  label: string;
  systemPrompt: string;
  language: string;
  voiceModel: string;
}

interface AgentConfigurationProps {
  agent: AgentDraft;
  setAgent: React.Dispatch<React.SetStateAction<AgentDraft>>;

  videos: VideoDraft[];

  assignedVideos: VideoAssignments;
  onAssignedVideos: (newAssignments: VideoAssignments) => void;
}

export function AgentConfiguration({
  agent,
  setAgent,
  assignedVideos,
  onAssignedVideos,
  videos,
}: AgentConfigurationProps) {
  // Handle agent name and system prompt
  const handleChange = (field: "label" | "systemPrompt", value: string) => {
    setAgent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //Handle voice setting
  const handleVoiceSetting = (language: string, voiceModel: string) => {
    setAgent((prev) => ({
      ...prev,
      language,
      voiceModel,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full mx-auto items-stretch">
      {/* Left - Agent Core + Voice */}
      <div className="flex flex-col h-full">
        <div className="bg-card border rounded-xl p-6 h-full flex flex-col gap-6">
          {/* Agent Name */}
          <Field className="flex flex-col gap-1.5">
            <FieldLabel
              htmlFor="input-name"
              className="text-sm font-semibold tracking-tight text-foreground/90"
            >
              Agent Name
            </FieldLabel>
            <Input
              id="input-name"
              placeholder="Give your agent a name..."
              value={agent.label}
              onChange={(e) => handleChange("label", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
            />
          </Field>

          {/* System Prompt */}
          <Field className="flex flex-col gap-1.5 flex-1">
            <FieldLabel
              htmlFor="input-prompt"
              className="text-sm font-semibold tracking-tight text-foreground/90"
            >
              System Prompt
            </FieldLabel>
            <Textarea
              id="input-prompt"
              value={agent.systemPrompt}
              onChange={(e) => handleChange("systemPrompt", e.target.value)}
              placeholder="e.g. You are a friendly and knowledgeable travel assistant..."
              className="flex min-h-[150px] w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm shadow-sm transition-all resize-none focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
            />
          </Field>

          {/* Voice Setting */}
          <div className="pt-4 border-t space-y-4">
            <VoiceSetting
              currentLang={agent.language}
              currentModel={agent.voiceModel}
              onChange={handleVoiceSetting}
            />
          </div>
        </div>
      </div>

      {/* Right - knowledgebase + Video binding*/}
      <div className="flex flex-col h-full">
        <div className="bg-card border rounded-xl p-6 h-full flex flex-col gap-6">
          {/* Knowledge Base */}
          <div>
            <Field>
              <FieldLabel className="text-sm font-semibold tracking-tight text-foreground/90">
                Knowledge Base
              </FieldLabel>
              <KnowledgeBaseStep />
            </Field>
          </div>

          {/* Video Binding */}
          <VideoSetting
            videos={videos}
            assignedVideos={assignedVideos}
            onChange={onAssignedVideos}
          />
        </div>
      </div>
    </div>
  );
}
