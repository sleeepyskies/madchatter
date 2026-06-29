import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-4 mt-auto border-t">
      <Button
        variant="outline"
        disabled={currentStep === 1}
        onClick={onBack}
      >
        Back
      </Button>

      <Button onClick={onNext}>
        {currentStep === totalSteps ? "Finish" : "Next"}
      </Button>
    </div>
  );
}
