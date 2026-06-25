import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { id: number; name: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <div key={step.id} className="relative flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium border transition-colors ${ 
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : step.id}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  {step.name}
                </span>
              </div>
            </div>

            <div
              className={`h-0.5 w-full rounded-full mt-1 transition-colors ${
                step.id <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
