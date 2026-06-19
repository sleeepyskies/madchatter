from db.models.agents import Agent
from models.agent import (
    AgentResponse,
    CreateAgentRequest,
    UpdateAgentRequest,
)
from repositories.agent_repository import AgentRepository


class AgentService:
    """Handles agent-related business logic."""

    def __init__(self, agent_repository: AgentRepository):
        self.agent_repository = agent_repository

    def create_agent(self, request: CreateAgentRequest) -> AgentResponse:
        agent = self.agent_repository.create(
            Agent(
                label=request.label,
                system_prompt=request.system_prompt,
                language=request.language,
                voice_model=request.voice_model,
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
