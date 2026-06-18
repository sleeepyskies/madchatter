import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VideoDraft } from "@/components/project/video/video-upload";

export const VIDEO_CONFIGS = [
  { key: "idle", label: "Idle Video", desc: "Default idle animation" },
  { key: "enter", label: "Enter Video", desc: "Session start" },
  { key: "exit", label: "Exit Video", desc: "Session end" },
] as const;

export type VideoKey = (typeof VIDEO_CONFIGS)[number]["key"];

export type VideoAssignments = Record<VideoKey, string | null>;

interface VideoSettingProps {
  assignedVideos: VideoAssignments;
  onChange: (newAssignments: VideoAssignments) => void;
  videos: VideoDraft[];
}

export function VideoSetting({
  assignedVideos,
  onChange,
  videos,
}: VideoSettingProps) {
  const [openStates, setOpenStates] = useState<Record<VideoKey, boolean>>({
    idle: false,
    enter: false,
    exit: false,
  });

  return (
    <div className="pt-4 border-t space-y-4">
      <h3 className="text-sm font-semibold">VIDEO SETTING</h3>

      {VIDEO_CONFIGS.map((config) => (
        <div key={config.key} className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">{config.label}</div>
            <div className="text-xs text-muted-foreground">{config.desc}</div>
          </div>

          <Popover
            open={openStates[config.key]}
            onOpenChange={(isOpen) =>
              setOpenStates((prev) => ({ ...prev, [config.key]: isOpen }))
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-between text-xs font-normal px-3 h-8 normal-case"
              >
                {assignedVideos[config.key]
                  ? videos.find((v) => v.tempId === assignedVideos[config.key])
                      ?.label
                  : "Select video..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandGroup>
                    {videos.map((video) => (
                      <CommandItem
                        key={video.tempId}
                        onSelect={() => {
                          onChange({
                            ...assignedVideos,
                            [config.key]: video.tempId,
                          });
                          setOpenStates((prev) => ({
                            ...prev,
                            [config.key]: false,
                          }));
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assignedVideos[config.key] === video.tempId
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {video.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      ))}
    </div>
  );
}
