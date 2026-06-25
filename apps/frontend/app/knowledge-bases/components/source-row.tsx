"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Pencil, Check, X } from "lucide-react";
import { DeleteButton } from "@/components/reusable/buttons/delete-button";
import { KnowledgeSourceResponse } from "@madchatter/api/src/knowledge";

interface SourceRowProps {
  knowledgeId: number;
  source: KnowledgeSourceResponse;
  onDelete: (id: number) => void;
  onRename: (id: number, label: string) => Promise<void>;
}

export function SourceRow({ source, onDelete, onRename }: SourceRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(source.label);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === source.label) {
      setDraft(source.label);
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      await onRename(source.id, trimmed);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setDraft(source.label);
    setEditing(false);
  };

  return (
    <div className="group grid grid-cols-12 gap-4 items-center px-6 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="col-span-9 md:col-span-10 flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 border border-border/40">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>

        {editing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
              disabled={saving}
              className="flex-1 min-w-0 text-sm bg-background border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button onClick={commit} disabled={saving} className="text-muted-foreground hover:text-foreground transition-colors">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={cancel} disabled={saving} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{source.label}</span>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="col-span-3 md:col-span-2 flex justify-end">
        <DeleteButton variant="icon" label="Remove" onConfirm={() => onDelete(source.id)} />
      </div>
    </div>
  );
}