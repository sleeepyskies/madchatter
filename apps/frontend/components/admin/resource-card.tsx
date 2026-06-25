"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/reusable/buttons/delete-button";
import { ComponentType } from "react";
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon } from "lucide-react";

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
 extraButtons
}: ResourceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsEditing(false);
    if (value.trim() && value.trim() !== label) {
      await onRename(value.trim());
    } else {
      setValue(label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setValue(label);
    }
  };

  return (
    <Card className="group relative min-h-[192px] rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col justify-between">
      <CardHeader className="p-0 flex flex-row items-center justify-between gap-3 space-y-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>

          <CardTitle className="flex-1 min-w-0 m-0 p-0 vertical-baseline">
            {isEditing ? (
              <Input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="h-8 w-full p-0 bg-transparent border-0 border-b border-primary rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary font-semibold text-lg md:text-lg text-neutral-900 dark:text-neutral-100 leading-none"
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="group/title flex items-center gap-2 cursor-pointer h-8 font-semibold text-lg text-neutral-900 dark:text-neutral-100"
              >
                <span className="truncate hover:underline decoration-dashed decoration-neutral-400 underline-offset-4">
                  {label}
                </span>
                <PencilIcon className="w-3.5 h-3.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70 group-focus/title:text-primary shrink-0" />
              </div>
            )}
          </CardTitle>
        </div>

        <div className="shrink-0">
          <DeleteButton onConfirm={onDelete}/>
        </div>
      </CardHeader>

      <div className="flex items-center justify-end gap-2 mt-4 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground cursor-pointer"
          onClick={onEdit}
        >
          Edit
        </Button>
        {extraButtons}
      </div>
    </Card>
  );
}
