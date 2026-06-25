"use client";

import { toast } from "sonner";
import { VideoResponse } from "@madchatter/api/src/videos";
import { projectsApi } from "@madchatter/api/src/projects";
import { FilterableSelect } from "@/components/reusable/filterable-select";

export interface Assignments {
  idleVideoId: number | null;
  enterVideoId: number | null;
  exitVideoId: number | null;
}

interface VideoAssignmentsProps {
  projectId: number;
  videos: VideoResponse[];
  assignments: Assignments;
  onChange: (updated: Assignments) => void;
}

type AssignmentKey = keyof Assignments;

interface RoleConfig {
  key: AssignmentKey;
  label: string;
}

const ROLES: readonly RoleConfig[] = [
  { key: "idleVideoId", label: "Idle Video" },
  { key: "enterVideoId", label: "Enter Video" },
  { key: "exitVideoId", label: "Exit Video" },
] as const;

export function VideoAssignments({
                                   projectId,
                                   videos,
                                   assignments,
                                   onChange,
                                 }: VideoAssignmentsProps) {
  const handleAssignment = async (role: AssignmentKey, value: number | null) => {
    onChange({ ...assignments, [role]: value });

    try {
      await projectsApi.updateProject(projectId, { [role]: value });
      toast.success("Assignment updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not save video assignment.");
    }
  };

  return (
    <div className="w-full rounded-xl border bg-muted/10 p-4">
      <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-4">
        {ROLES.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
              {label}
            </span>
            <div className="w-[160px]">
              <FilterableSelect
                value={assignments[key]}
                options={videos}
                onChange={(val) => handleAssignment(key, val)}
                placeholder="Select video..."
                allowNull
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
