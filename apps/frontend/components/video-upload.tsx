"use client";
import { useRef, ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { videosApi } from "@/api/videos";

export interface VideoDraft {
  id?: number;
  file?: File | null;
  previewUrl: string;
  label: string;
  description: string;
}

interface VideoUploadProps {
  videos: VideoDraft[];
  setVideos: React.Dispatch<React.SetStateAction<VideoDraft[]>>;
}

export function VideoUpload({ videos, setVideos }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newVidoes: VideoDraft[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Please only select video files.", {
          position: "top-center",
        });
        return;
      }
      newVidoes.push({
        file,
        previewUrl: URL.createObjectURL(file),
        label: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
      });
    });

    setVideos((prev) => [...prev, ...newVidoes]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleDeleteVideo(indexToRemove: number) {
    const targetVideo = videos[indexToRemove];
    if (targetVideo?.previewUrl) {
      URL.revokeObjectURL(targetVideo.previewUrl);
    }
    if (targetVideo?.id !== undefined) {
      try {
        await videosApi.deleteVideo(targetVideo.id);
      } catch (error) {
        console.error("Failed to delete video:", error);
        toast.error("Failed to delete video from server.");
        return;
      }
    }
    setVideos((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  const handleFieldChange = (
    index: number,
    field: "label" | "description",
    value: string,
  ) => {
    setVideos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-start">
        {videos.map((video, index) => (
          <div
            key={index}
            className="group relative flex flex-col gap-3 p-3 rounded-xl border bg-card shadow-sm"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black border">
              <video
                src={video.previewUrl}
                className="w-full h-full object-cover"
                controls
              />
              <button
                type="button"
                onClick={() => handleDeleteVideo(index)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Video Title"
                value={video.label}
                onChange={(e) =>
                  handleFieldChange(index, "label", e.target.value)
                }
                className="h-8 text-sm font-medium"
              />
              <Textarea
                placeholder="Add a description for this video..."
                value={video.description}
                onChange={(e) =>
                  handleFieldChange(index, "description", e.target.value)
                }
                className="text-xs resize-none min-h-[60px] max-h-[100px]"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddVideoClick}
          className="w-full aspect-video sm:h-[180px] rounded-xl bg-muted/40 border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/80 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
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
