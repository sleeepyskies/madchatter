"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Brain03Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { KnowledgeResponse } from "@madchatter/api/src/knowledge";
import { DeleteButton } from "@/components/reusable/buttons/delete-button";

interface KnowledgeCardProps {
  knowledge: KnowledgeResponse;
  onDelete: (id: number) => void;
}

export function KnowledgeCard(props: KnowledgeCardProps) {
  const router = useRouter();

  return (
    <div
      className="group relative min-h-[192px] rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={Brain03Icon} className="h-5 w-5 text-primary"/>
        </div>
        <div>
          <h3 className="font-semibold text-lg leading-none">
            {props.knowledge.label}
          </h3>
        </div>

        <DeleteButton onConfirm={() => props.onDelete(props.knowledge.id)}/>
      </div>
      <div
        className="mt-4 p-3 overflow-hidden">
        <p className="text-sm text-muted-foreground line-clamp-3 break-words">
          Contains {props.knowledge.sources.length} sources
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground cursor-pointer"
          onClick={() => router.push(`/knowledge-base/${props.knowledge.id}`)}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}
