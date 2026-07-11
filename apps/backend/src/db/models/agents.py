from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Agent(Base):
    """
    An agent is essentially a collection of configuration options used when triggering the AI pipeline.
    These options influence the agents personality, voice and model.
    """
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    """ID of the row."""

    label: Mapped[str] = mapped_column(nullable=False)
    """User provided label for this agent."""

    system_prompt: Mapped[str] = mapped_column(nullable=False)
    """User provided system prompt for this agent."""

    language: Mapped[str] = mapped_column(nullable=False)
    """""The language of this agent."""

    voice_model: Mapped[str] = mapped_column(nullable=False)
    """The voice model to use for this agent. Note that this must correspond to a model located in /static."""
