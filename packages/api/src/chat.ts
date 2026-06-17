import { client } from "./client";

const api = client.extend((options) => ({
  prefix: `${options.prefix}/chat`,
}));

export interface ApplyProjectResponse {
  message: string;
  project_id: number;
}

export interface LatestReplyResponse {
  reply: string;
}

export const chatApi = {
  applyProject: async (projectId: number): Promise<ApplyProjectResponse> => {
    return await api.post(`apply/${projectId}`).json();
  },

  chat: async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append("file", file);

    return await api
      .post("", {
        body: formData,
      })
      .blob();
  },

  getLatestReply: async (): Promise<LatestReplyResponse> => {
    return await api.get("latest_reply").json();
  },
};
