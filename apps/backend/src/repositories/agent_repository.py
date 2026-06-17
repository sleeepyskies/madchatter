from sqlalchemy import select
from sqlalchemy.orm import Session

from api.api_exception import ResourceNotFoundException
from db.models.agents import Agent
from models.agent import UpdateAgentRequest


class AgentRepository:
    """Provides access to the database for agent-related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, agent: Agent) -> Agent:
        self.database.add(agent)
        self.database.commit()
        self.database.refresh(agent)
        return agent

    def get(self, agent_id: int) -> Agent:
        agent = self.database.get(Agent, agent_id)
        if not agent:
            raise ResourceNotFoundException("Agents", agent_id)
        return agent

    def list(self) -> list[Agent]:
        return list(self.database.scalars(select(Agent)).all())

    def update(self, agent_id: int, update: UpdateAgentRequest) -> Agent:
        agent = self.get(agent_id)

        if update.label is not None:
            agent.label = update.label
        if update.system_prompt is not None:
            agent.system_prompt = update.system_prompt
        if update.language is not None:
            agent.language = update.language
        if update.voice_model is not None:
            agent.voice_model = update.voice_model

        self.database.commit()
        self.database.refresh(agent)
        return agent

    def delete(self, agent_id: int) -> None:
        agent = self.get(agent_id)
        self.database.delete(agent)
        self.database.commit()
