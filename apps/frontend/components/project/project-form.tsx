/**
 * Project Form component:
 * The whole project form which can be reused in both creating a new project and updating exsisting project.
 */
"use client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  VideoUpload,
  type VideoDraft,
} from "@/components/project/video/video-upload";
import { AgentConfiguration } from "@/components/project/agent/agent-configuration";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "@/components/project/step-indicator";
import { StepNavigation } from "@/components/project/step-navigation";
import { ProjectHeader } from "@/components/project/project-header";
import { processVideos } from "@/components/project/video/video-service";
import { saveProject } from "@/components/project/project-service";
import { updateProjectOnly } from "@/components/project/update-project-only-service";
import { VideoAssignments } from "@/components/project/agent/video-setting";

import { agentsApi } from "@madchatter/api/src/agents";
import { videosApi } from "@madchatter/api/src/videos";
import { projectsApi } from "@madchatter/api/src/projects";

const STEPS = [
  { id: 1, name: "Videos Upload", description: "" },
  { id: 2, name: "Agent Configuration", description: "" },
];

const backendPort = process.env.SERVER_PORT || "8000";
const address = process.env.ADDRESS || "127.0.0.1";

// Pass the projectId to enter edit mode, otherwise will create a new project.
export default function ProjectForm({ projectId }: { projectId?: number }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [videos, setVideos] = useState<VideoDraft[]>([]);
  const [videoIds, setVideoIds] = useState<number[]>([]);

  // The configuration of special videos.
  const [assignedVideos, setAssignedVideos] = useState<VideoAssignments>({
    idle: null,
    enter: null,
    exit: null,
  });

  const [agent, setAgent] = useState({
    label: "",
    systemPrompt: "",
    language: "en",
    voiceModel: "",
  });
  const [agentId, setAgentId] = useState<number | undefined>(undefined);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Load existing project data on mount.
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        const projectRes = await projectsApi.getProject(projectId!);
        const agentRes = await agentsApi.getAgent(projectRes.agent!.id);
        setAgent({
          label: agentRes.label,
          systemPrompt: agentRes.systemPrompt,
          language: agentRes.language,
          voiceModel: agentRes.voiceModel,
        });
        setAgentId(agentRes.id);

        const videoDrafts: VideoDraft[] = [];
        for (const video of projectRes.videos) {
          const vid = await videosApi.getVideo(video.id);
          videoDrafts.push({
            tempId: uuidv4(),
            id: vid.id,
            previewUrl: `http://${address}:${backendPort}/videos/${vid.filename}`,
            label: vid.label,
            description: vid.description,
          });
        }
        setVideos(videoDrafts);
        setVideoIds(projectRes.videos.map((video) => video.id));
        const idleVideo = videoDrafts.find(
          (v) => v.id === projectRes.idle_video?.id,
        );

        const enterVideo = videoDrafts.find(
          (v) => v.id === projectRes.enter_video?.id,
        );

        const exitVideo = videoDrafts.find(
          (v) => v.id === projectRes.exit_video?.id,
        );

        setAssignedVideos({
          idle: idleVideo?.tempId ?? null,
          enter: enterVideo?.tempId ?? null,
          exit: exitVideo?.tempId ?? null,
        });
      } catch (error) {
        console.log("Failed to load project:", error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle Next Button Click
  const handleNext = async () => {
    if (currentStep === STEPS.length) {
      // save the project in the last step, first create/update project, get project ID, then create videos, get
      // video ids, and save the videoIds, idle/enter/exitId into project.
      setIsSaving(true);

      try {
        const projectRes = await saveProject(!!projectId, {
          projectId: projectId || undefined,
          agentId: agentId,
          agentLabel: agent.label,
          agentSystemPrompt: agent.systemPrompt,
          agentLanguage: agent.language,
          agentVoiceModel: agent.voiceModel,
          idleVideoId: null,
          enterVideoId: null,
          exitVideoId: null,
        });

        const videosWithProjectId = videos.map((video) => ({
          ...video,
          projectId: projectRes.id,
        }));

        const uploadedVideos = await SaveVideos(videosWithProjectId);
        if (!uploadedVideos) return;

        // map tempID to videoID
        const idleVideoId =
          uploadedVideos.find((v) => v.tempId === assignedVideos.idle)?.id ??
          null;

        const enterVideoId =
          uploadedVideos.find((v) => v.tempId === assignedVideos.enter)?.id ??
          null;

        const exitVideoId =
          uploadedVideos.find((v) => v.tempId === assignedVideos.exit)?.id ??
          null;

        // update project for updating idle, enter, exit video ID
        const upDatedProjectRes = await updateProjectOnly({
          projectId: projectRes.id,
          label: projectRes.label,
          agentId: projectRes.agent!.id,
          knowledgeId: projectRes.knowledge_id,
          idleVideoId: idleVideoId,
          enterVideoId: enterVideoId,
          exitVideoId: exitVideoId,
        });
        console.log("Project Response", upDatedProjectRes);

        toast.success("Project saved successfully!");
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to save project:", error);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const SaveVideos = async (
    videosToUpload: VideoDraft[],
  ): Promise<VideoDraft[] | null> => {
    setIsUploading(true);

    const updatedVideos = await processVideos(videosToUpload);

    setIsUploading(false);

    if (!updatedVideos) {
      console.log("Videos Upload failed.");
      return null;
    }

    setVideos(updatedVideos);

    const newVideoIds = updatedVideos.map((v) => v.id) as number[];
    setVideoIds(newVideoIds);
    return updatedVideos;
  };

  const handleAssignedVideos = (assignments: VideoAssignments) => {
    setAssignedVideos(assignments);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen flex-col bg-background">
        {/* Project Header (Back)*/}
        <ProjectHeader
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onBack={() => router.push("/dashboard")}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />
          <Separator />

          <div className="flex flex-1 flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {STEPS[currentStep - 1].name}
              </h2>
            </div>

            {currentStep === 1 && (
              <VideoUpload videos={videos} setVideos={setVideos} />
            )}
            {currentStep === 2 && (
              <AgentConfiguration
                agent={agent}
                setAgent={setAgent}
                videos={videos}
                assignedVideos={assignedVideos}
                onAssignedVideos={handleAssignedVideos}
              />
            )}
          </div>

          {/* Step Navigation */}
          <StepNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            isUploading={isUploading}
            isSaving={isSaving}
            onNext={handleNext}
            onBack={() => setCurrentStep((prev) => prev - 1)}
          />
        </main>
      </div>
    </TooltipProvider>
  );
}
