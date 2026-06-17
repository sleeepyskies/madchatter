/**
 * UI component for managing video drafts.
 * Provides video selection, preview, metadata editing, and deletion.
 */
"use client";
import { useRef, ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { videosApi } from "@madchatter/api/src/videos";

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

    const newVideos: VideoDraft[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Please only select video files.", {
          position: "top-center",
        });
        return;
      }
      newVideos.push({
        file,
        previewUrl: URL.createObjectURL(file),
        label: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
      });
    });

    setVideos((prev) => [...prev, ...newVideos]);

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
    <div className="space-y-8">
      <input
        type="file"
        accept="video/*"
        className="hidden"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Video Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={index}
              className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-video bg-black">
                <video
                  src={video.previewUrl}
                  className="w-full h-full object-cover"
                  controls
                />

                <button
                  type="button"
                  onClick={() => handleDeleteVideo(index)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 group rounded-lg hover:bg-muted/20 transition">
                <Input
                  type="text"
                  value={video.label}
                  placeholder="Untitled video"
                  onChange={(e) =>
                    handleFieldChange(index, "label", e.target.value)
                  }
                  className="h-8 px-2 text-sm font-medium border-0 bg-transparent shadow-none leading-tight focus-visible:ring-0 focus-visible:outline-none"
                />

                <Textarea
                  value={video.description}
                  placeholder="Add a short description..."
                  onChange={(e) =>
                    handleFieldChange(index, "description", e.target.value)
                  }
                  className="text-xs border-0 bg-muted/30 rounded-md px-2.5 py-2 shadow-none resize-none max-h-[56px] overflow-y-auto leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/15 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          ))}

          {/* add button */}
          <button
            type="button"
            onClick={handleAddVideoClick}
            className="group flex flex-col items-center justify-center gap-3 aspect-video rounded-xl border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>

            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
              Add New Video
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
