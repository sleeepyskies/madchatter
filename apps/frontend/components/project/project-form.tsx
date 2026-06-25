"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "@/components/project/step-indicator";
import { ProjectHeader } from "@/components/project/project-header";
import { StepNavigation } from "@/components/project/step-navigation";
import { VideoStep } from "./video/video-step";
import { AgentStep } from "@/components/project/agent-step";

const STEPS = [
  { id: 1, name: "Video Upload" },
  { id: 2, name: "Agent Configuration" },
];

export default function ProjectForm({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleNext = () => {
    if (currentStep === STEPS.length) {
      toast.success("Project finalized successfully!", { position: "top-center" });
      router.push("/projects");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ProjectHeader
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onBack={() => router.push("/dashboard")}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="flex flex-1 flex-col gap-6">
          {currentStep === 1 && (
            <VideoStep projectId={projectId}/>
          )}

          {currentStep === 2 && (
            <AgentStep projectId={projectId}/>
          )}
        </div>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onNext={handleNext}
          onBack={() => setCurrentStep((prev) => prev - 1)}
        />
      </main>
    </div>
  );
}
