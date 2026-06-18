"use client";

import { BaseDialog } from "@/components/reusable/dialog/base-dialog";

interface DeleteDialogProps {
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}

export function DeleteDialog(props: DeleteDialogProps) {
  return (
    <BaseDialog
      title="Are you sure?"
      description="This action cannot be undone. This will permenently delete this item."
      confirmText="Delete"
      confirmVariant="destructive"
      cancelText="Cancel"
      onConfirm={props.onConfirm}
    >
      {props.children}
    </BaseDialog>
  );
}