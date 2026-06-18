"use client";

import { BaseDialog } from "@/components/reusable/dialog/base-dialog";

interface ConfirmDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText = "Confirm",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <BaseDialog
      title={title}
      description={description}
      confirmText={confirmText}
      confirmVariant="default"
      cancelText="Cancel"
      onConfirm={onConfirm}
    >
      {children}
    </BaseDialog>
  );
}