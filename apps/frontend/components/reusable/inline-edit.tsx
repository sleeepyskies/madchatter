"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PencilIcon } from "lucide-react";

export function InlineEdit({ value, onSave }: { value: string; onSave: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setText(value), [value]);
  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (text.trim() !== value) onSave(text.trim());
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => e.key === "Enter" && handleSave()}
      className="h-8 w-full p-0 bg-transparent border-0 border-b border-primary rounded-none shadow-none focus-visible:ring-0 focus-visible:border-primary font-semibold text-lg md:text-lg text-neutral-900 dark:text-neutral-100 leading-none"
    />
  ) : (
    <div
      onClick={() => setIsEditing(true)}
      className="group/title flex items-center gap-2 cursor-pointer h-8 font-semibold text-lg text-neutral-900 dark:text-neutral-100"
    >
      <span className="truncate hover:underline decoration-dashed decoration-neutral-400 underline-offset-4">
        {text}
      </span>
      <PencilIcon className="w-3.5 h-3.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70 group-focus/title:text-primary shrink-0" />
    </div>
  );
}
