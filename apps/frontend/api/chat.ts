import { client, serverOrigin } from "./client";
import { VideoResponse } from "./videos";

const api = client.extend((options) => ({
  prefix: `${options.prefix}/chat`,
}));

export type Mode = "video_only" | "video_and_tts" | "tts_only";

export interface ApplyProjectResponse {
  projectId: number
}
export interface ChatRequest {
  userText: string;
}

export interface ChatModeResponse {
  mode: Mode;
  videoId: number | null;
  userText: string | null;
}

export interface VideoPreloadResponse {
  idle_video: VideoResponse | null;
  enter_video: VideoResponse | null;
  exit_video: VideoResponse | null;
  videos: VideoResponse[] | null;
}

export interface LatestReplyResponse {
  reply: string;
}

export const chatApi = {
  applyProject: async (projectId: number): Promise<ApplyProjectResponse> => {
    return await api.post(`apply/${projectId}`).json();
  },

  getChatMode: async (file: File): Promise<ChatModeResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return await api.post("mode", {
      body: formData,
    }).json()
  },

  streamChat: async (userText: string) => {
    const res = await fetch(`${serverOrigin}/api/chat/stream_chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userText }),
    });

    if (!res.body) throw new Error("No stream body");

    return res.body; // ReadableStream
  },

  exitChat: async (): Promise<ChatModeResponse> => {

    return await api.post("exit_chat").json()
  },

  getLatestReply: async (): Promise<LatestReplyResponse> => {
    return await api.get("latest_reply").json();
  },
  preloadVideos: async (): Promise<VideoPreloadResponse> => {
    return await api.get("preload_videos").json();
  },
};
