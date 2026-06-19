import { client } from "./client";

const api = client.extend((options) => ({
  prefix: `${options.prefix}/agents`,
}));

export type Language = "DE" | "EN";

export interface AgentResponse {
  id: number;
  label: string;
  systemPrompt: string;
  language: Language;
  voiceModel: string;
}

export interface CreateAgentRequest {
  label: string;
  systemPrompt: string;
  language: Language;
  voiceModel: string;
}

export interface UpdateAgentRequest {
  label?: string;
  systemPrompt?: string;
  language?: Language;
  voiceModel?: string;
}

export const agentsApi = {
  createAgent: async (request: CreateAgentRequest): Promise<AgentResponse> => {
    return await api.post("", {json: request}).json();
  },

  listAgents: async (): Promise<AgentResponse[]> => {
    return await api.get("").json();
  },

  getAgent: async (agentId: number): Promise<AgentResponse> => {
    return await api.get(`${agentId}`).json();
  },

  updateAgent: async (
    agentId: number,
    request: UpdateAgentRequest,
  ): Promise<AgentResponse> => {
    return await api.patch(`${agentId}`, {json: request}).json();
  },

  deleteAgent: async (agentId: number): Promise<void> => {
    await api.delete(`${agentId}`);
  },
};
