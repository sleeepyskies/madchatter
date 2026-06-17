/**
 * Step Navigation Component:
 * A component that controls the next and back button.
 */

import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  isUploading: boolean;
  isSaving: boolean;
  onNext: () => void;
  onBack: () => void;
}

const LoadingSpinner = ({ text }: { text: string }) => (
  <span className="flex items-center gap-2">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
    {text}
  </span>
);

export function StepNavigation({
  currentStep,
  totalSteps,
  isUploading,
  isSaving,
  onNext,
  onBack,
}: StepNavigationProps) {
  const isLoading = isUploading || isSaving;

  return (
    <div className="flex justify-between items-center pt-4 mt-auto border-t">
      <Button
        className="cursor-pointer"
        variant="outline"
        disabled={currentStep === 1 || isLoading}
        onClick={onBack}
      >
        Back
      </Button>

      <Button className="cursor-pointer" disabled={isLoading} onClick={onNext}>
        {isUploading ? (
          <LoadingSpinner text="Uploading..." />
        ) : isSaving ? (
          <LoadingSpinner text="Saving..." />
        ) : currentStep === totalSteps ? (
          "Save"
        ) : (
          "Next"
        )}
      </Button>
    </div>
  );
}
