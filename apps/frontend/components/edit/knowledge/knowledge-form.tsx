"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EditResourceHeader } from "@/components/edit/edit-resource-header";
import { InlineEdit } from "@/components/reusable/inline-edit";
import { SourceCard } from "./source-card";
import { knowledgeApi, KnowledgeResponse, KnowledgeSourceResponse } from "@/api/knowledge";

export default function KnowledgeForm({
  knowledgeId,
}: {
  knowledgeId: number;
}) {
  const [knowledge, setKnowledge] = useState<KnowledgeResponse>();
  const [sources, setSources] = useState<KnowledgeSourceResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const [k, s] = await Promise.all([
          knowledgeApi.getKnowledge(knowledgeId),
          knowledgeApi.listKnowledgeSources(knowledgeId),
        ]);
        setKnowledge(k);
        setSources(s);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load knowledge base.", {
          position: "top-center",
        });
      }
    }
    fetch();
  }, [knowledgeId]);

  const handleRename = async (newName: string) => {
    try {
      await knowledgeApi.updateKnowledge(knowledgeId, { label: newName });
      setKnowledge((prev) => (prev ? { ...prev, label: newName } : undefined));
      toast.success("Knowledge base renamed", { position: "top-center" });
    } catch {
      toast.error("Failed to rename knowledge base", {
        position: "top-center",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newSource = await knowledgeApi.addSourceToKnowledge(
        knowledgeId,
        file.name,
        file,
      );
      setSources((prev) => [...prev, newSource]);
      toast.success("Source uploaded", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload file", { position: "top-center" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (sourceId: number) => {
    try {
      await knowledgeApi.removeSourceFromKnowledge(knowledgeId, sourceId);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      toast.success("Source removed", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove source", { position: "top-center" });
    }
  };

  if (!knowledge) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditResourceHeader>
        <InlineEdit value={knowledge.label} onSave={handleRename} />
      </EditResourceHeader>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-semibold text-foreground">Sources</h3>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 gap-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Source
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.txt,.pdf"
            className="hidden"
          />

          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onDelete={handleDelete}
              />
            ))}
            {sources.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl">
                No sources uploaded yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
