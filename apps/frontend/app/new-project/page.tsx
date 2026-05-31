"use client";
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { VideoUpload } from "@/components/video-upload";
import { Personality } from "@/components/personality";
const STEPS = [
  { id: 1, name: "Videos Upload", description: "" },
  { id: 2, name: "Voice Configuration", description: "" },
  { id: 3, name: "Agent Personality", description: "" },
];

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1);
  const [videos, setVideos] = useState<string[]>([]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center border-b px-6 justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">New Project</span>
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

            {/* <div className="min-h-[300px] flex-1 rounded-xl bg-muted/50 border p-4">
              <p className="text-sm text-muted-foreground">Test</p>
            </div> */}

            {currentStep === 1 && (
              <VideoUpload videos={videos} setVideos={setVideos} />
            )}
            {currentStep === 3 && <Personality />}
          </div>

          <div className="flex justify-between items-center pt-4 mt-auto border-t">
            <Button
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
            <Button
              disabled={currentStep === STEPS.length}
              onClick={() => setCurrentStep((prev) => prev + 1)}
            >
              {currentStep === STEPS.length ? "Save" : "Next"}
            </Button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
