from db.models.agents import Agent
from models.agent import (
    AgentResponse,
    CreateAgentRequest,
    UpdateAgentRequest,
)
from repositories.agent_repository import AgentRepository, UpdateAgent


class AgentService:
    """Handles agent-related business logic."""

    def __init__(self, agent_repository: AgentRepository):
        self.agent_repository = agent_repository

    def create_agent(self, request: CreateAgentRequest) -> AgentResponse:
        agent = self.agent_repository.create(Agent(
            label=request.label,
            system_prompt=request.system_prompt,
        ))
        return AgentResponse(
            id=agent.id,
            label=agent.label,
            system_prompt=agent.system_prompt,
        )

    def get_agent(self, agent_id: int) -> AgentResponse | None:
        agent = self.agent_repository.get(agent_id)
        if not agent:
            return None
        return AgentResponse(
            id=agent.id,
            label=agent.label,
            system_prompt=agent.system_prompt,
        )

    def list_agents(self) -> list[AgentResponse]:
        return [AgentResponse(
            id=agent.id,
            label=agent.label,
            system_prompt=agent.system_prompt,
        ) for agent in self.agent_repository.list()]

    def update_agent(self, agent_id: int, request: UpdateAgentRequest) -> AgentResponse | None:
        agent = self.agent_repository.update(agent_id, UpdateAgent(
            label=request.label,
            system_prompt=request.system_prompt,
        ))
        if not agent:
            return None
        return AgentResponse(
            id=agent.id,
            label=agent.label,
            system_prompt=agent.system_prompt,
        )

    def delete_agent(self, agent_id: int) -> bool:
        if not self.agent_repository.get(agent_id):
            return False
        return self.agent_repository.delete(agent_id)
