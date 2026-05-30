import ky from "ky";

const api = ky.create({prefix: "/api/settings"});

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "de";

export interface SettingsResponse {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
}

export interface UpdateSettingsRequest {
    theme?: Theme | null;
    language?: Language | null;
    notificationsEnabled?: boolean | null;
}

export const settingsApi = {
    getSettings: async (): Promise<SettingsResponse> => {
        return await api.get("").json();
    },

    updateSettings: async (request: UpdateSettingsRequest): Promise<SettingsResponse> => {
        return await api.patch("", {json: request}).json();
    },
};
