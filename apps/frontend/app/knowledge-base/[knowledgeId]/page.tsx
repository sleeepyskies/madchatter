"use client";

import {
  knowledgeApi,
  KnowledgeResponse,
  KnowledgeSourceResponse
} from "@madchatter/api/src/knowledge";
import { KnowledgeHeader } from "../components/knowledge-header";
import { SourceRow } from "../components/source-row";
import { redirect, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, HardDrive, Loader2, Upload } from "lucide-react";

export default function EditKnowledgePage() {
  const {knowledgeId} = useParams();
  const id = Number(knowledgeId);

  const [knowledge, setKnowledge] = useState<KnowledgeResponse>();
  const [sources, setSources] = useState<KnowledgeSourceResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goToDashboard = () => redirect("/dashboard");

  useEffect(() => {
    if (isNaN(id)) {
      goToDashboard();
      return;
    }
    (async () => {
      const [knowledgeData, sourcesData] = await Promise.all([
        knowledgeApi.getKnowledge(id),
        knowledgeApi.listKnowledgeSources(id),
      ]);
      setKnowledge(knowledgeData);
      setSources(sourcesData);
    })();
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const newSource = await knowledgeApi.addSourceToKnowledge(id, file.name, file);
      setSources((prev) => [...prev, newSource]);
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (sourceId: number) => {
    await knowledgeApi.removeSourceFromKnowledge(id, sourceId);
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  const handleRename = async (sourceId: number, label: string) => {
    const updated = await knowledgeApi.updateSource(sourceId, {label});
    setSources((prev) => prev.map((s) => (s.id === sourceId ? updated : s)));
  };

  if (!knowledge) return <div>Could not load knowledge base.</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <KnowledgeHeader title={knowledge.label} onBack={goToDashboard}/>

      <main
        className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <h2 className="text-2xl font-bold tracking-tight">Sources</h2>

        <div className="space-y-6">
          {/* Toolbar */}
          <div
            className="flex items-center justify-between border border-border bg-muted/40 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4"/>
              <span>{sources.length} total objects stored</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".md,.txt,.pdf"
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> :
                <Upload className="h-4 w-4"/>}
              {isUploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>

          {/* File list */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div
              className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
              <div className="col-span-9 md:col-span-10">Name</div>
            </div>

            {sources.length === 0 ? (
              <div
                className="p-12 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60 stroke-[1.5]"/>
                <p className="text-sm font-medium">This knowledge base directory is empty.</p>
                <p className="text-xs text-muted-foreground/80">Upload documents above to feed
                  context into your agents.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sources.map((source) => (
                  <SourceRow
                    key={source.id}
                    knowledgeId={id}
                    source={source}
                    onDelete={handleDelete}
                    onRename={handleRename}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
