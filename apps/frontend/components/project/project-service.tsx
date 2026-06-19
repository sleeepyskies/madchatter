/**
 * Handles project and agent creating and updating operations.
 */

import { agentsApi, Language, UpdateAgentRequest } from "@madchatter/api/src/agents";
import { projectsApi, ProjectResponse } from "@madchatter/api/src/projects";

export interface SaveProjectData {
  projectId?: number;

  agentId?: number;
  agentLabel: string;
  agentSystemPrompt: string;
  agentLanguage: Language;
  agentVoiceModel: string;
  knowledgeId?: number | null;
  idleVideoId?: number | null;
  enterVideoId?: number | null;
  exitVideoId?: number | null;
}

export const saveProject = async (
  isUpdate: boolean,
  data: SaveProjectData,
): Promise<ProjectResponse> => {
  // Agent service
  const agentData = {
    label: data.agentLabel || "Untitled Agent",
    systemPrompt: data.agentSystemPrompt || "You are a helpful assistant",
    language: data.agentLanguage || "en",
    voiceModel: data.agentVoiceModel || "en_US-amy-low.onnx",
  };
  const agentRes = isUpdate
    ? await agentsApi.updateAgent(data.agentId!, agentData)
    : await agentsApi.createAgent(agentData);

  // Project Service
  const projectPayload = {
    label: agentRes.label,
    agentId: agentRes.id,
    knowledgeId: data.knowledgeId ?? null,
    idleVideoId: data.idleVideoId ?? null,
    enterVideoId: data.enterVideoId ?? null,
    exitVideoId: data.exitVideoId ?? null,
  };
  return isUpdate
    ? await projectsApi.updateProject(data.projectId!, projectPayload)
    : await projectsApi.createProject(projectPayload);
};
