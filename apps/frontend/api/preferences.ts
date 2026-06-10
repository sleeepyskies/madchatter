import client from "@/api/client";

const api = client.extend((options) =>
    ({prefix: `${options.prefix}/preferences`})
);

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "de";

export interface Preferences {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
}

export interface UpdatePreferencesRequest {
    theme?: Theme | null;
    language?: Language | null;
    notificationsEnabled?: boolean | null;
}

export const preferencesApi = {
    getPreferences: async (): Promise<Preferences> => {
        return await api.get("").json();
    },

    updatePreferences: async (request: UpdatePreferencesRequest): Promise<Preferences> => {
        return await api.patch("", {json: request}).json();
    },
};
