/**
 * Header component for the project form workflow.
 * Displays the current step and handles navigation back to the dashboard.
 */
import { ArrowLeft } from "lucide-react";
import { ConfirmDialog } from "@/components/reusable/dialog/confirm-dialog";

interface ProjectHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}
export function ProjectHeader({
  currentStep,
  totalSteps,
  onBack,
}: ProjectHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-6 justify-between">
      <div className="flex items-center gap-2">
        <ConfirmDialog
          title="Are you absolutely sure?"
          description="You have not saved your project yet. Leaving this page will discard your current setup."
          confirmText="Leave Page"
          onConfirm={onBack}
        >
          <button className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-black transition cursor-pointer">
            <ArrowLeft />
            Back to Dashboard
          </button>
        </ConfirmDialog>
      </div>

      <div className="text-sm text-muted-foreground">
        Step {currentStep} / {totalSteps}
      </div>
    </header>
  );
}
