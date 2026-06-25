"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/reusable/buttons/delete-button";
import { ComponentType } from "react";
import { InlineEdit } from "@/components/reusable/inline-edit";

interface ResourceCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onDelete: () => Promise<void>;
  onEdit: () => void;
  onRename: (newLabel: string) => Promise<void>;
  extraButtons?: React.ReactNode;
}

export function ResourceCard({
                               icon: Icon,
                               label,
                               description,
                               onDelete,
                               onEdit,
                               onRename,
                               extraButtons,
                             }: ResourceCardProps) {
  return (
    <Card className="group relative min-h-[192px] rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col justify-between">
      <CardHeader className="p-0 flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>

          <CardTitle className="flex-1 min-w-0">
            <InlineEdit value={label} onSave={onRename} />
          </CardTitle>
        </div>

        <div className="shrink-0">
          <DeleteButton onConfirm={onDelete} />
        </div>
      </CardHeader>

      <div className="flex items-center justify-end gap-2 mt-4 shrink-0">
        <Button variant="ghost" size="sm" className="text-muted-foreground cursor-pointer" onClick={onEdit}>
          Edit
        </Button>
        {extraButtons}
      </div>
    </Card>
  );
}
