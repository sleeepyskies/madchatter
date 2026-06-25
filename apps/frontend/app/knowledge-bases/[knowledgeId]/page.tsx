import KnowledgeForm from "@/components/edit/knowledge/knowledge-form";

export default async function EditKnowledgePage({params}: {
  params: Promise<{ knowledgeId: number }>;
}) {
  const { knowledgeId} = await params;
  return <KnowledgeForm knowledgeId={Number(knowledgeId)} />;
}
