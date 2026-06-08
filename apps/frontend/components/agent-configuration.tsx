import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeBaseStep } from "@/components/knowledge-base";

export interface AgentDraft {
  id?: number;
  label: string;
  systemPrompt: string;
}

interface AgentConfigurationProps {
  agent: AgentDraft;
  setAgent: React.Dispatch<React.SetStateAction<AgentDraft>>;
}
export function AgentConfiguration({
  agent,
  setAgent,
}: AgentConfigurationProps) {
  const handleChange = (field: "label" | "systemPrompt", value: string) => {
    setAgent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl w-full mx-auto">
      <div className="flex flex-col gap-6 w-full">
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
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>

        <Field className="flex flex-col gap-1.5">
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
            className="flex min-h-[235px] w-full rounded-lg border border-slate-200 bg-background px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </Field>
      </div>

      <div className="w-full flex flex-col justify-start">
        <Field>
          <FieldLabel
            htmlFor="input-prompt"
            className="text-sm font-semibold tracking-tight text-foreground/90"
          >
            Knowledge Base
          </FieldLabel>
          <KnowledgeBaseStep />
        </Field>
      </div>
    </div>
  );
}
