"use client";

import { useEffect, useState } from "react";

import { knowledgeApi, KnowledgeResponse } from "@madchatter/api/src/knowledge";
import { KnowledgeCard } from "./components/knowledge-card";
import { useAdminHeader } from "../../../providers/admin-header-provider";

export default function Page() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeResponse[]>([]);
  const {setTitle} = useAdminHeader();

  useEffect(() => {
    setTitle("Knowledge Bases");
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setKnowledgeBases(await knowledgeApi.listKnowledge());
      } catch (error) {
        console.error("Could not fetch knowledge bases from backend:", error);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (knowledgeId: number) => {
    try {
      await knowledgeApi.deleteKnowledge(knowledgeId);
      setKnowledgeBases((prev) => prev.filter((p) => p.id !== knowledgeId));
    } catch (error) {
      console.error("Could not delete knowledge base:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {knowledgeBases.length === 0 ? (
          <div className="col-span-full mt-8 text-center text-muted-foregroundr">
            No knowledge bases found.
          </div>
        ) : (
          knowledgeBases.map((knowledge) => (
            <KnowledgeCard
              key={knowledge.id}
              knowledge={knowledge}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
