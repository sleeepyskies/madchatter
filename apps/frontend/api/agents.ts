import client from "@/api/client";

const api = client.extend((options) =>
    ({prefix: `${options.prefix}/agents`})
);

export interface AgentResponse {
  id: number;
  label: string;
  systemPrompt: string;
}

export interface CreateAgentRequest {
  label: string;
  systemPrompt: string;
}

export interface UpdateAgentRequest {
  label?: string;
  systemPrompt?: string;
}

export const agentsApi = {
  createAgent: async (request: CreateAgentRequest): Promise<AgentResponse> => {
    return await api.post("", { json: request }).json();
  },

  listAgents: async (): Promise<AgentResponse[]> => {
    return await api.get("").json();
  },

  getProject: async (agentId: number): Promise<AgentResponse> => {
    return await api.get(`${agentId}`).json();
  },

  updateAgent: async (
    agentId: number,
    request: UpdateAgentRequest,
  ): Promise<AgentResponse> => {
    return await api.patch(`${agentId}`, { json: request }).json();
  },

  deleteAgent: async (agentId: number): Promise<void> => {
    await api.delete(`${agentId}`);
  },
};
