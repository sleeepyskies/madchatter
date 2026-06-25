"use client";

import { ArrowLeft } from "lucide-react";
import { ConfirmDialog } from "@/components/reusable/dialog/confirm-dialog";

interface KnowledgeHeaderProps {
  title: string;
  onBack: () => void;
}

export function KnowledgeHeader({ title, onBack }: KnowledgeHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b px-6 justify-between bg-background">
      <div className="flex items-center gap-2">
        <ConfirmDialog
          title="Are you sure?"
          description=""
          confirmText="Back to Dashboard"
          onConfirm={onBack}
        >
          <button className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-black transition cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </ConfirmDialog>
      </div>
    </header>
  );
}