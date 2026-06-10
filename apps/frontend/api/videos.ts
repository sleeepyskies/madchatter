import client from "@/api/client";

const api = client.extend((options) =>
    ({prefix: `${options.prefix}/videos`})
);

export interface CreateVideoRequest {
  label: string;
  description: string;
}

export interface UpdateVideoRequest {
  label?: string;
  description?: string;
}

export interface SimpleVideoResponse {
  id: number;
  label: string;
  filename: string;
  description: string;
}

export const videosApi = {
  uploadVideo: async (
    file: File,
    request: CreateVideoRequest,
  ): Promise<SimpleVideoResponse> => {
    const form = new FormData();

    form.append("file", file);
    form.append("label", request.label);
    form.append("description", request.description);

    return await api
      .post<SimpleVideoResponse>("upload", { body: form, timeout: false })
      .json();
  },

  listVideos: async (): Promise<SimpleVideoResponse[]> => {
    return await api.get<SimpleVideoResponse>("").json();
  },

  getVideo: async (videoId: number): Promise<SimpleVideoResponse> => {
    return await api.get<SimpleVideoResponse>(`${videoId}`).json();
  },

  updateVideo: async (
    videoId: number,
    request: UpdateVideoRequest,
  ): Promise<SimpleVideoResponse> => {
    return await api
      .patch<SimpleVideoResponse>(`${videoId}`, { json: request })
      .json();
  },

  deleteVideo: async (videoId: number): Promise<void> => {
    await api.delete(`${videoId}`);
  },
};
