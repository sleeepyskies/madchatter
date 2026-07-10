import { Suspense } from "react";
import AgentFormClient from "@/components/admin/agent/agent-form-client";

export default function EditAgentPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <AgentFormClient />
      </Suspense>
  );
}
