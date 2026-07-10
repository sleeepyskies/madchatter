"use client";

import { useSearchParams } from "next/navigation";
import KnowledgeForm from "@/components/admin/knowledge/knowledge-form";

export default function KnowledgeFormClient() {
  const searchParams = useSearchParams();
  const knowledgeId = Number(searchParams.get("knowledgeId"));

  return <KnowledgeForm knowledgeId={knowledgeId} />;
}