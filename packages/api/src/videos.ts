import {client} from "./client";

const api = client.extend((options) => ({
    prefix: `${options.prefix}/videos`,
}));

export interface VideoResponse {
    id: number;
    label: string;
    filename: string;
    description: string;
}

export interface UpdateVideoRequest {
    label?: string | null;
    description?: string | null;
}

export const videosApi = {
    uploadVideo: async (
        label: string,
        description: string,
        file: File,
    ): Promise<VideoResponse> => {
        const formData = new FormData();
        formData.append("label", label);
        formData.append("description", description);
        formData.append("file", file);

        return await api.post("upload", {body: formData}).json();
    },

    listVideos: async (): Promise<VideoResponse[]> => {
        return await api.get("").json();
    },

    getVideo: async (videoId: number): Promise<VideoResponse> => {
        return await api.get(`${videoId}`).json();
    },

    updateVideo: async (
        videoId: number,
        request: UpdateVideoRequest,
    ): Promise<VideoResponse> => {
        return await api.patch(`${videoId}`, {json: request}).json();
    },

    deleteVideo: async (videoId: number): Promise<void> => {
        await api.delete(`${videoId}`);
    },
};
