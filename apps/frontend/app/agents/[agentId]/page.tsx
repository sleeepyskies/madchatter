import AgentForm from "@/components/edit/agent/agent-form";

export default async function EditAgentPage({params}: {
  params: Promise<{ agentId: number }>;
}) {
  const { agentId } = await params;
  return <AgentForm agentId={Number(agentId)} />;
}
