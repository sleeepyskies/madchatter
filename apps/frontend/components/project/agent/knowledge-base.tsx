/**
 * UI component for managing the knowledge base of agent.
 */
"use client";

import { BrainCircuit } from "lucide-react";
import { KnowledgeResponse } from "@madchatter/api/src/knowledge";

export interface KnowledgeBaseStepProps {
  selectedId: number | null;
  options: KnowledgeResponse[];
  onSelect: (id: number | null) => void;
}

// todo(skye): i just put some ai bullshit here, rewrite this to look better. it works doe
export function KnowledgeBaseStep({
  selectedId,
  options,
  onSelect,
}: KnowledgeBaseStepProps) {
  console.log(options);
  return (
    <div className="flex flex-col gap-3 w-full border rounded-lg p-3 bg-background shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((kb) => {
          const isSelected = selectedId === kb.id;
          return (
            <button
              key={kb.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : kb.id)}
              className={`cursor-pointer flex items-center gap-3 p-3 text-left border rounded-xl transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <BrainCircuit className="h-4 w-4"/>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{kb.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
