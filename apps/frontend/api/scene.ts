import ky from "ky";

const api = ky.create({ prefix: "/api/scenes" });

export interface SceneResponse {
    id: number;
    label: string;
    agentId?: number;
    videoIds: number[];
}

export interface CreateSceneRequest {
    label: string;
    agentId?: number;
    videoIds: number[];
}

export interface UpdateSceneRequest {
    label?: string;
    agentId?: number | null;
    videoIds?: number[];
}

export const scenesApi = {
    createScene: async (request: CreateSceneRequest): Promise<SceneResponse> => {
        return await api.post("", { json: request }).json();
    },

    listScenes: async (): Promise<SceneResponse[]> => {
        return await api.get("").json();
    },

    getScene: async (sceneId: number): Promise<SceneResponse> => {
        return await api.get(`${sceneId}`).json();
    },

    updateScene: async (sceneId: number, request: UpdateSceneRequest): Promise<SceneResponse> => {
        return await api.put(`${sceneId}`, { json: request }).json();
    },
};
