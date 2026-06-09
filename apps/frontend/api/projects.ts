import ky from "ky";

// const api = ky.create({ prefix: "/api/projects" });

const backendPort = process.env.SERVER_PORT || "8000";
const address = process.env.ADDRESS || "127.0.0.1";
const api = ky.create({
  prefix: `http://${address}:${backendPort}/api/projects`,
});

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
