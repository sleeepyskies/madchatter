import {client} from "./client";
import {AgentResponse} from "./agents";
import {VideoResponse} from "./videos";

const api = client.extend((options) => ({
  prefix: `${options.prefix}/projects`,
}));

export interface ProjectResponse {
  id: number;
  label: string;
  agent: AgentResponse | null;
  videos: VideoResponse[];
  knowledge_id: number | null;
  idle_video: VideoResponse | null;
  enter_video: VideoResponse | null;
  exit_video: VideoResponse | null;
}

export interface CreateProjectRequest {
  label: string;
  agent_id: number;
  video_ids: number[];
  knowledge_id: number | null;
  idle_video_id: number | null;
  enter_video_id: number | null;
  exit_video_id: number | null;
}

export interface UpdateProjectRequest {
  label?: string | null;
  agent_id?: number | null;
  knowledge_id?: number | null;
  idle_video_id?: number | null;
  enter_video_id?: number | null;
  exit_video_id?: number | null;
}

export const projectsApi = {
  createProject: async (request: CreateProjectRequest): Promise<ProjectResponse> => {
    return await api.post("", {json: request}).json();
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
    return await api.patch(`${projectId}`, {json: request}).json();
  },

  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`${projectId}`);
  },
};
