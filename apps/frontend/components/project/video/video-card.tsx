"use client";

import { useState } from "react";
import { Trash2, Volume2, VolumeX, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VideoResponse, videosApi } from "@madchatter/api/src/videos";
import { VideoFormModal } from "./video-form";

interface VideoCardProps {
  video: VideoResponse;
  onDelete: (id: number) => void;
  onUpdate: (updated: VideoResponse) => void;
}

export function VideoCard({ video, onDelete, onUpdate }: VideoCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditSubmit = async (data: { label: string; description: string; includesAudio: boolean }) => {
    setIsUpdating(true);
    try {
      const res = await videosApi.updateVideo(video.id, {
        label: data.label,
        description: data.description,
        includesAudio: data.includesAudio,
      });
      onUpdate(res);
      setIsEditOpen(false);
      toast.success("Video updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update video configuration");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:shadow-sm transition-all">
        {/* Tiny Video Thumbnail Preview */}
        <div className="relative h-14 aspect-video bg-black rounded-lg overflow-hidden shrink-0">
          <video src={video.downloadUrl} className="w-full h-full object-cover p-0" muted />
        </div>

        {/* Info Layout */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{video.label}</span>
            {video.includesAudio ? (
              <Volume2 className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-md">
            {video.description || "No description provided."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(video.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <VideoFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        isUploading={isUpdating}
        onSubmit={handleEditSubmit}
        initialValues={{
          label: video.label,
          description: video.description,
          includesAudio: video.includesAudio,
        }}
      />
    </>
  );
}
