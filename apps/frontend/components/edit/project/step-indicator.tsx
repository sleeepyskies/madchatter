import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: { id: number; name: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div
      className="grid gap-4 min-w-[320px] w-full"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="relative flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium border transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={`text-sm font-semibold whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {step.name}
              </span>
            </div>

            {/* Line connector */}
            <div
              className={`h-0.5 w-full rounded-full mt-3 transition-colors ${
                step.id <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
