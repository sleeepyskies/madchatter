import client from "@/api/client";

const api = client.extend((options) =>
    ({prefix: `${options.prefix}/projects`})
);

export interface ProjectResponse {
  id: number;
  label: string;
  agentId?: number;
  agentLabel?: string;
  agentSystemPrompt?: string;
  videoIds: number[];
}

export interface CreateProjectRequest {
  label: string;
  agentId?: number;
  videoIds: number[];
}

export interface UpdateProjectRequest {
  label?: string;
  agentId?: number | null;
  videoIds?: number[];
}

export const projectsApi = {
  createProject: async (
    request: CreateProjectRequest,
  ): Promise<ProjectResponse> => {
    return await api.post("", { json: request }).json();
  },

  listProjects: async (): Promise<ProjectResponse[]> => {
    return await api.get("").json();
  },

  getProject: async (projectId: number): Promise<ProjectResponse> => {
    return await api.get(`${projectId}`).json();
  },

  updateProject: async (
    projectId: number,
    request: UpdateProjectRequest,
  ): Promise<ProjectResponse> => {
    return await api.put(`${projectId}`, { json: request }).json();
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`${projectId}`);
  },
};
