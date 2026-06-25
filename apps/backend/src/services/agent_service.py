from db.models.agents import Agent
from models.agent import (
    AgentResponse,
    CreateAgentRequest,
    UpdateAgentRequest, Language, VoiceModelResponse,
)
from repositories.agent_repository import AgentRepository
from settings import settings


class AgentService:
    """Handles agent-related business logic."""

    def __init__(self, agent_repository: AgentRepository):
        self.agent_repository = agent_repository
        self.voice_models_directory = settings.static_dir.joinpath("voice-models")

    def create_agent(self, request: CreateAgentRequest) -> AgentResponse:
        agent = self.agent_repository.create(
            Agent(
                label=request.label,
                system_prompt=request.system_prompt or "",
                language=request.language or "en",
                voice_model=request.voice_model or "todo",
            )
        )
        return AgentResponse.model_validate(agent)

    def get_agent(self, agent_id: int) -> AgentResponse:
        agent = self.agent_repository.get(agent_id)
        return AgentResponse.model_validate(agent)

    def list_agents(self) -> list[AgentResponse]:
        return [AgentResponse.model_validate(agent) for agent in self.agent_repository.list()]

    def update_agent(self, agent_id: int, request: UpdateAgentRequest) -> AgentResponse:
        agent = self.agent_repository.update(agent_id, request)
        return AgentResponse.model_validate(agent)

    def delete_agent(self, agent_id: int) -> None:
        self.agent_repository.delete(agent_id)


    def get_voice_models(self) -> list[VoiceModelResponse]:
        voice_models: list[VoiceModelResponse] = []

        if not self.voice_models_directory.exists():
            return voice_models

        for lang_dir in self.voice_models_directory.iterdir():
            if lang_dir.is_dir():
                lang = lang_dir.name
                if lang not in [l.value for l in Language]:
                    continue

                for model_file in lang_dir.glob("*.onnx"):
                    config_file = model_file.with_suffix(model_file.suffix + ".json")

                    if config_file.exists():
                        voice_models.append(
                            VoiceModelResponse(
                                language=Language(lang),
                                label=model_file.stem
                            )
                        )

        return voice_models