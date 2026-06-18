"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface BaseDialogProps {
  children: React.ReactNode;
  content?: React.ReactNode;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
  confirmVariant: "default" | "destructive";
}

export function BaseDialog({
  children,
  content,
  title,
  description,
  cancelText,
  confirmText,
  onConfirm,
  confirmVariant = "default",
}: BaseDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="py-2">{content}</div>

        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          {onConfirm && (
            <AlertDialogAction
              onClick={onConfirm}
              className={confirmVariant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}