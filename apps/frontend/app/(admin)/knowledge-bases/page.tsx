"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { knowledgeApi, KnowledgeResponse } from "@madchatter/api/src/knowledge";
import { ResourcePageLayout } from "@/components/admin/resource-page-layout";
import { ResourceCard } from "@/components/admin/resource-card";

export default function KnowledgeAdminPage() {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await knowledgeApi.listKnowledge();
        setKnowledgeBases(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    const knowledge = await knowledgeApi.createKnowledge({ label: 'New Project'});
    router.push(`/knowledge-base/${knowledge.id}`);
  };

  const handleDelete = async (id: number) => {
    await knowledgeApi.deleteKnowledge(id);
    setKnowledgeBases((prev) => prev.filter((k) => k.id !== id));
  };

  const handleRename = async (id: number, newLabel: string) => {
    setKnowledgeBases((prev) =>
      prev.map((k) => (k.id === id ? { ...k, label: newLabel } : k))
    );
    await knowledgeApi.updateKnowledge(id, { label: newLabel });
  };

  return (
    <ResourcePageLayout
      title="Knowledge Bases"
      resourceName="knowledge bases"
      itemsCount={knowledgeBases.length}
      isLoading={isLoading}
      headerAction={
        <Button onClick={handleCreate} size="sm" className="gap-2 cursor-pointer">
          <PlusIcon className="w-4 h-4" /> Create Knowledge Base
        </Button>
      }
    >
      {knowledgeBases.map((knowledge) => (
        <ResourceCard
          key={knowledge.id}
          icon={DatabaseIcon}
          label={knowledge.label}
          description=""
          onDelete={() => handleDelete(knowledge.id)}
          onEdit={() => router.push(`/knowledge-base/${knowledge.id}`)}
          onRename={(newLabel) => handleRename(knowledge.id, newLabel)}
        />
      ))}
    </ResourcePageLayout>
  );
}
