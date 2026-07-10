"use client";

import { useSearchParams } from "next/navigation";
import AgentForm from "@/components/admin/agent/agent-form";

export default function AgentFormClient() {
  const searchParams = useSearchParams();
  const agentId = Number(searchParams.get("agentId"));

  return <AgentForm agentId={agentId} />;
}