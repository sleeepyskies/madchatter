"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/reusable/dialog/delete-dialog";

interface DeleteButtonProps {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  variant?: "icon" | "text";
  label?: string;
}

export function DeleteButton({
   onConfirm,
   variant = "icon",
   label = "Delete",
}: DeleteButtonProps) {
  return (
    <DeleteDialog onConfirm={onConfirm}>
      {variant === "icon" ? (
        <button
          type="button"
          className="cursor-pointer absolute top-3 right-3 p-1.5 rounded-md bg-secondary text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-secondary/80"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      ) : (
        <Button variant="destructive" size="sm" className="cursor-pointer gap-2">
          <Trash2 className="h-4 w-4" />
          {label}
        </Button>
      )}
    </DeleteDialog>
  );
}
