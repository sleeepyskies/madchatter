from dataclasses import dataclass

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from db.models.agents import Agent


@dataclass
class UpdateAgent:
    label: str | None
    system_prompt: str | None


class AgentRepository:
    """Provides access to the database for agent-related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, agent: Agent) -> Agent:
        self.database.add(agent)
        self.database.commit()
        self.database.refresh(agent)
        return agent

    def get(self, agent_id: int) -> Agent | None:
        return self.database.get(Agent, agent_id)

    def list(self) -> list[Agent]:
        return list(self.database.scalars(select(Agent)).all())

    def update(self, agent_id: int, update: UpdateAgent) -> Agent | None:
        agent = self.get(agent_id)
        if not agent:
            return None

        if update.label is not None:
            agent.label = update.label
        if update.system_prompt is not None:
            agent.system_prompt = update.system_prompt

        self.database.commit()
        self.database.refresh(agent)
        return agent

    def delete(self, agent_id: int) -> bool:
        result = self.database.execute(delete(Agent).where(Agent.id == agent_id))
        self.database.commit()
        return result.rowcount > 0
