/**
 * Handles video upload and update operations.
 */
const backendPort = process.env.SERVER_PORT || "8000";
const address = process.env.ADDRESS || "127.0.0.1";
import { VideoDraft } from "@/components/project/video/video-upload";
import { videosApi } from "@madchatter/api/src/videos";

export const processVideos = async (
  videos: VideoDraft[],
): Promise<VideoDraft[] | null> => {
  try {
    const updatedVideos = await Promise.all(
      videos.map(async (video) => {
        const currentVideo = { ...video };

        if (!currentVideo.id) {
          // upload a new video
          if (!currentVideo.file) {
            throw new Error("Video file is missing.");
          }

          const res = await videosApi.uploadVideo(
            currentVideo.label,
            currentVideo.description ?? "No description available",
            currentVideo.file,
            currentVideo.projectId!,
          );
          currentVideo.id = res.id;
        } else {
          // update the existing video
          const res = await videosApi.updateVideo(currentVideo.id, {
            label: currentVideo.label,
            description: currentVideo.description,
          });
          currentVideo.previewUrl = `http://${address}:${backendPort}/videos/${res.filename}`;
        }
        return currentVideo;
      }),
    );

    return updatedVideos;
  } catch (error) {
    console.error("Video processing failed:", error);
    return null;
  }
};
