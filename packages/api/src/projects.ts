import { client } from "./client";
import { AgentResponse } from "./agents";
import { VideoResponse } from "./videos";

const api = client.extend((options) => ({
  prefix: `${options.prefix}/projects`,
}));

export interface ProjectResponse {
  id: number;
  label: string;
  agent: AgentResponse | null;
  videos: VideoResponse[];
  knowledgeId: number | null;
  idleVideo: VideoResponse | null;
  enterVideo: VideoResponse | null;
  exitVideo: VideoResponse | null;
}

export interface CreateProjectRequest {
  label: string;
  agentId?: number | null;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
}

export interface UpdateProjectRequest {
  label?: string | null;
  agentId?: number | null;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
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
    return await api.patch(`${projectId}`, { json: request }).json();
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`${projectId}`);
  },
};
