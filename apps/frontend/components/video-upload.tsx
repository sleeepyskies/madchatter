"use client";
import { useRef, ChangeEvent, useState } from "react";
import { Plus, Trash2, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  videos: string[];
  setVideos: React.Dispatch<React.SetStateAction<string[]>>;
}

export function VideoUpload({ videos, setVideos }: VideoUploadProps) {
  // system file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newVidoes: string[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Please only select video files.", {
          position: "top-center",
        });
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      newVidoes.push(videoUrl);
    });

    setVideos((prev) => [...prev, ...newVidoes]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  function handleDeleteVideo(indexToRemove: number) {
    setVideos((prev) => prev.filter((_, index) => index != indexToRemove));
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        type="file"
        accept="video/*"
        className="hidden"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="grid auto-rows-min gap-4 grid-cols-2 md:grid-cols-3">
        {videos.map((videoSrc, index) => (
          <div
            key={index}
            className="group relative aspect-video rounded-xl overflow-hidden bg-black border"
          >
            <video
              src={videoSrc}
              className="w-full h-full object-cover"
              controls
            />

            <button
              type="button"
              onClick={() => handleDeleteVideo(index)}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddVideoClick}
          className="aspect-video rounded-xl bg-muted/40 border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/80 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <div className="p-3 rounded-full bg-background border border-dashed shadow-sm">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Add Videos</span>
        </button>
      </div>
    </div>
  );
}
