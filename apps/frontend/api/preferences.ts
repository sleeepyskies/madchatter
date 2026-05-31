import ky from "ky";

const api = ky.create({prefix: "/api/preferences"});

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "de";

export interface Preferences {
    theme: Theme;
    language: Language;
    notificationsEnabled: boolean;
}

export interface UpdatePreferencesRequets {
    theme?: Theme | null;
    language?: Language | null;
    notificationsEnabled?: boolean | null;
}

export const preferences = {
    getPreferences: async (): Promise<Preferences> => {
        return await api.get("").json();
    },

    updatePreferences: async (request: UpdatePreferencesRequets): Promise<Preferences> => {
        return await api.patch("", {json: request}).json();
    },
};
