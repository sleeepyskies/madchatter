"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SelectOption {
  id: number;
  label: string;
}

interface IdSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
  options: SelectOption[];
  placeholder?: string;
  allowNull?: boolean;
}

export function FilterableSelect({
                           value,
                           onChange,
                           options,
                           placeholder = "Select...",
                           allowNull = true,
                         }: IdSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.id === value)?.label || "";

  // Synchronize input text with current selection when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setSearch(value === null && allowNull ? "None" : selectedLabel);
    }
  }, [value, open, selectedLabel, allowNull]);

  // Handle outside clicks safely without Radix lifecycle side-effects
  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative w-full">
        <Input
          value={search}
          placeholder={placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setSearch(""); // Instantly clear text to display full option set
          }}
          className="w-full pr-8 text-sm h-9 bg-background cursor-text"
        />
        <ChevronsUpDown className="absolute right-2.5 top-2.5 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-50 min-w-[8rem] w-full mt-1 p-1 max-h-[240px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          <div className="space-y-0.5">
            {allowNull && (!search || "none".includes(search.toLowerCase())) && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-2.5 py-2 text-xs italic rounded-md text-left transition-colors cursor-pointer text-muted-foreground hover:bg-muted/60",
                  value === null && "bg-muted font-medium text-foreground"
                )}
              >
                <Check className={cn("mr-2 h-3.5 w-3.5 shrink-0", value === null ? "opacity-100" : "opacity-0")} />
                None
              </button>
            )}

            {filteredOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-2.5 py-2 text-xs rounded-md text-left transition-colors cursor-pointer hover:bg-muted/60",
                  value === opt.id && "bg-muted font-medium text-foreground"
                )}
              >
                <Check className={cn("mr-2 h-3.5 w-3.5 shrink-0", value === opt.id ? "opacity-100" : "opacity-0")} />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}

            {filteredOptions.length === 0 && (!allowNull || search) && (
              <div className="p-3 text-xs text-center text-muted-foreground">
                No options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
