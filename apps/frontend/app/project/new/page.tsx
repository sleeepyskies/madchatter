"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Check, ArrowLeft } from "lucide-react";
import { VideoUpload, type VideoDraft } from "@/components/video-upload";
import { AgentConfiguration } from "@/components/agent-configuration";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { videosApi } from "@/api/videos";
import { projectsApi } from "@/api/projects";
import { agentsApi } from "@/api/agents";

const STEPS = [
  { id: 1, name: "Videos Upload", description: "" },
  { id: 2, name: "Voice Configuration", description: "" },
  { id: 3, name: "Agent Configuration", description: "" },
];

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1);

  const [videos, setVideos] = useState<VideoDraft[]>([]);
  const [videoIds, setVideoIds] = useState<number[]>([]);
  const [agent, setAgent] = useState({
    label: "",
    systemPrompt: "",
  });
  const [agentId, setAgentId] = useState<number | undefined>(undefined);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (currentStep === 1) {
      const success = await uploadVideoStep();
      if (!success) return;
    }

    if (currentStep === STEPS.length) {
      setIsSaving(true);
      console.log("Save project config...");
      try {
        const agentRes = await agentsApi.createAgent({
          label: agent.label || "Untitled Agent",
          systemPrompt: agent.systemPrompt || "You are a helpful assistant.",
        });
        const res = await projectsApi.createProject({
          label: agentRes.label,
          agentId: agentRes.id,
          videoIds: videoIds,
        });
        console.log("project created", res);
        toast.success("Project saved successfully!", {
          position: "top-center",
        });
        router.push("/dashboard");

        return;
      } catch (error) {
        console.error("Failed to save project:", error);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const uploadVideoStep = async () => {
    const isAllUploaded =
      videos.length > 0 &&
      videos.every((v) => v.id !== undefined && v.id !== null);

    if (isAllUploaded) {
      return true;
    }

    setIsUploading(true);

    try {
      const updatedVideosWithId = [];

      for (const video of videos) {
        if (video.id) {
          updatedVideosWithId.push(video);
          continue;
        }

        const res = await videosApi.uploadVideo(video.file!, {
          label: video.label,
          description: video.description || "No description available",
        });

        updatedVideosWithId.push({
          ...video,
          id: res.id,
        });
      }

      setVideos(updatedVideosWithId);

      const newVideoIds = updatedVideosWithId.map((v) => v.id) as number[];
      setVideoIds(newVideoIds);

      console.log("All videos processed successfully.");
      return true;
    } catch (error) {
      console.error("Videos Upload failed:", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center border-b px-6 justify-between">
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-black transition cursor-pointer">
                  <ArrowLeft />
                  Back to Dashboard
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have not save your project yet. Leaving this page will
                    discard your current setup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push("/dashboard")}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} / {STEPS.length}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;

              return (
                <div key={step.id} className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium border transition-colors ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                            ? "border-primary text-primary"
                            : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {step.name}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-1 w-full rounded-full mt-2 transition-colors ${
                      step.id <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex flex-1 flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {STEPS[currentStep - 1].name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </div>

            {currentStep === 1 && (
              <VideoUpload videos={videos} setVideos={setVideos} />
            )}
            {currentStep === 3 && (
              <AgentConfiguration agent={agent} setAgent={setAgent} />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 mt-auto border-t">
            <Button
              className="cursor-pointer"
              variant="outline"
              disabled={currentStep === 1 || isUploading || isSaving}
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button
              disabled={isUploading || isSaving}
              onClick={handleNext}
              className="cursor-pointer"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Uploading...
                </span>
              ) : isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </span>
              ) : currentStep === STEPS.length ? (
                "Save"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
