import {client} from "./client";

const api = client.extend((options) => ({
    prefix: `${options.prefix}/knowledge`,
}));

export interface KnowledgeResponse {
    id: number;
    label: string;
    sources: KnowledgeSourceResponse[];
}

export interface CreateKnowledgeRequest {
    label: string;
}

export interface UpdateSourceRequest {
    label?: string | null;
}

export interface KnowledgeSourceResponse {
    id: number;
    label: string;
    downloadUrl: string;
}

export const knowledgeApi = {
    createKnowledge: async (request: CreateKnowledgeRequest): Promise<KnowledgeResponse> => {
        return await api.post("", {json: request}).json();
    },

    listKnowledge: async (): Promise<KnowledgeResponse[]> => {
        return await api.get("").json();
    },

    getKnowledge: async (knowledgeId: number): Promise<KnowledgeResponse> => {
        return await api.get(`${knowledgeId}`).json();
    },

    listKnowledgeSources: async (knowledgeId: number): Promise<KnowledgeSourceResponse[]> => {
        return await api.get(`${knowledgeId}/sources`).json();
    },

    deleteKnowledge: async (knowledgeId: number): Promise<void> => {
        await api.delete(`${knowledgeId}`);
    },

    addSourceToKnowledge: async (
        knowledgeId: number,
        label: string,
        file: File,
    ): Promise<KnowledgeSourceResponse> => {
        const formData = new FormData();
        formData.append("label", label);
        formData.append("file", file);

        return await api.patch(`${knowledgeId}/sources`, {body: formData}).json();
    },

    removeSourceFromKnowledge: async (knowledgeId: number, sourceId: number): Promise<void> => {
        await api.delete(`${knowledgeId}/sources/${sourceId}`);
    },

    updateSource: async(sourceId: number, request: UpdateSourceRequest): Promise<KnowledgeSourceResponse> => {
        return await api.patch(`sources/${sourceId}`, {json: request}).json();
    }
};