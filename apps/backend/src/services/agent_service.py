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

    def get_agent(self, agent_id: int) -> AgentResponse:
        agent = self.agent_repository.get(agent_id)
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

    def update_agent(self, agent_id: int, request: UpdateAgentRequest) -> AgentResponse:
        agent = self.agent_repository.update(agent_id, UpdateAgent(
            label=request.label,
            system_prompt=request.system_prompt,
        ))
        return AgentResponse(
            id=agent.id,
            label=agent.label,
            system_prompt=agent.system_prompt,
        )

    def delete_agent(self, agent_id: int) -> None:
        self.agent_repository.delete(agent_id)
