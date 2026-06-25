"use client";

import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeSourceResponse } from "@madchatter/api/src/knowledge";

interface SourceCardProps {
  source: KnowledgeSourceResponse;
  onDelete: (id: number) => void;
}

export function SourceCard({ source, onDelete }: SourceCardProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
      <div className="h-14 w-20 flex items-center justify-center bg-secondary rounded-lg shrink-0">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-sm font-semibold text-foreground truncate">
          {source.label}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {source.label.split('.').pop()} file
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(source.downloadUrl, "_blank")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(source.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
