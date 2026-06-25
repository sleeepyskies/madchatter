"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { projectsApi } from "@madchatter/api/src/projects";
import { EditResourceHeader } from "@/components/edit/edit-resource-header";
import { StepIndicator } from "@/components/edit/project/step-indicator";
import { StepNavigation } from "@/components/edit/project/step-navigation";
import { VideoStep } from "./video/video-step";
import { InlineEdit } from "@/components/reusable/inline-edit";
import { AgentStep } from "@/components/edit/project/agent-step";

const STEPS = [
  { id: 1, name: "Video Upload" },
  { id: 2, name: "Agent Configuration" },
];

export default function ProjectForm({ projectId }: { projectId: number }) {
  const [name, setName] = useState("Loading...");
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    projectsApi.getProject(projectId)
      .then((p) => setName(p.label))
      .catch(() => setName("Unnamed Project"));
  }, [projectId]);

  const handleRename = async (newName: string) => {
    try {
      await projectsApi.updateProject(projectId, { label: newName });
      setName(newName);
      toast.success("Project renamed");
    } catch {
      toast.error("Failed to rename project");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditResourceHeader>
        <InlineEdit value={name} onSave={handleRename} />
      </EditResourceHeader>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="flex flex-1 flex-col gap-6">
          {currentStep === 1 && <VideoStep projectId={projectId} />}
          {currentStep === 2 && <AgentStep projectId={projectId} />}
        </div>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onNext={() => currentStep < STEPS.length && setCurrentStep(currentStep + 1)}
          onBack={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
        />
      </main>
    </div>
  );
}
