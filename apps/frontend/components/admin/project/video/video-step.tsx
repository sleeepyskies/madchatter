"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VideoAssignments, Assignments } from "./video-assignments";
import { VideoCard } from "./video-card";
import { VideoFormModal } from "./video-form";
import { projectsApi } from "@/api/projects";
import { VideoResponse, videosApi } from "@/api/videos";

export function VideoStep({ projectId }: { projectId: number }) {
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignments>({
    idleVideoId: null,
    enterVideoId: null,
    exitVideoId: null,
  });

  useEffect(() => {
    async function fetch() {
      try {
        const project = await projectsApi.getProject(projectId);
        setVideos(project.videos);
        setAssignments({
          idleVideoId: project.idleVideo?.id ?? null,
          enterVideoId: project.enterVideo?.id ?? null,
          exitVideoId: project.exitVideo?.id ?? null,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load project elements.", {
          position: "top-center",
        });
      }
    }
    fetch();
  }, [projectId]);

  useEffect(() => {
    let hasChanged = false;
    const newAssignments = { ...assignments };

    (Object.keys(newAssignments) as Array<keyof Assignments>).forEach((key) => {
      const assignedId = newAssignments[key];
      if (assignedId) {
        const video = videos.find((v) => v.id === assignedId);
        if (video?.includesAudio) {
          newAssignments[key] = null;
          hasChanged = true;
        }
      }
    });

    if (hasChanged) {
      setAssignments(newAssignments);
      projectsApi.updateProject(projectId, newAssignments).catch((err) => {
        console.error("Cleanup sync failed:", err);
      });
    }
  }, [videos, assignments, projectId]);

  const handleCreateSubmit = async (data: {
    label: string;
    description: string;
    includesAudio: boolean;
    file?: File;
  }) => {
    if (!data.file) {
      toast.error("Please select a video file.", { position: "top-center" });
      return;
    }
    if (!data.file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.", {
        position: "top-center",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedVideo = await videosApi.uploadVideo({
        label: data.label,
        description: data.description,
        projectId: projectId,
        includesAudio: data.includesAudio,
        file: data.file,
      });

      setVideos((prev) => [...prev, uploadedVideo]);
      toast.success("Video uploaded.", { position: "top-center" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video.", { position: "top-center" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await videosApi.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setAssignments((prev) => ({
        idleVideoId: prev.idleVideoId === id ? null : prev.idleVideoId,
        enterVideoId: prev.enterVideoId === id ? null : prev.enterVideoId,
        exitVideoId: prev.exitVideoId === id ? null : prev.exitVideoId,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove video.", { position: "top-center" });
    }
  };

  return (
    <div className="space-y-6">
      <VideoAssignments
        projectId={projectId}
        videos={videos}
        assignments={assignments}
        onChange={setAssignments}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-semibold text-foreground">Video</h3>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </div>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              projectId={projectId}
              video={video}
              onDelete={handleDelete}
              onUpdate={(updated) =>
                setVideos((prev) =>
                  prev.map((v) => (v.id === video.id ? updated : v)),
                )
              }
            />
          ))}
          {videos.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-xl">
              No videos uploaded yet.
            </div>
          )}
        </div>
      </div>

      <VideoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isUploading={isUploading}
        onSubmit={handleCreateSubmit}
        projectId={projectId}
      />
    </div>
  );
}
