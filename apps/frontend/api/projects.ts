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
  terms: string | null;
}

export interface CreateProjectRequest {
  label: string;
  agentId?: number | null;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
  terms?: string | null;
}

export interface UpdateProjectRequest {
  label?: string | null;
  agentId?: number | null;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
  terms?: string | null;
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

  exportProject: async (projectId: number): Promise<void> => {
    const res = await api.get(`${projectId}/export`);

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${projectId}.zip`;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
  },

  importProject: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post("import", {
      body: formData,
    });
  },
};
