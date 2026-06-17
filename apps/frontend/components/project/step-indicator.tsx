import { Check } from "lucide-react";

/**
 * Stepper Component:
 * A progress indicator that visualizes the current state of a multi-step workflow.
 * It displays step labels, completion status, and connection lines to guide users through a sequential process.
 */

interface StepIndicatorProps {
  steps: { id: number; name: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:gap-6"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step) => {
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
  );
}
