/**
 * This service only for updating project.
 */
import { projectsApi, ProjectResponse } from "@madchatter/api/src/projects";
export interface UpdateProjectOnlyData {
  projectId: number;
  label: string;
  agentId: number;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
}

export const updateProjectOnly = async (
  data: UpdateProjectOnlyData,
): Promise<ProjectResponse> => {
  return await projectsApi.updateProject(data.projectId, {
    label: data.label,
    agent_id: data.agentId,
    knowledge_id: data.knowledgeId ?? null,
    idle_video_id: data.idleVideoId ?? null,
    enter_video_id: data.enterVideoId ?? null,
    exit_video_id: data.exitVideoId ?? null,
  });
};
