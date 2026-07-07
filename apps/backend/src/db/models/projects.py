from sqlalchemy import ForeignKey, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Project(Base):
    """
    Projects are the overarching resource in MadChatter.

    A project consists of 3 main resources:
    1. A grouping of videos.
    2. An agent.
    3. A knowledge base.
    """
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    """ID of the row."""

    label: Mapped[str] = mapped_column(nullable=False)
    """User defined label for the project."""

    agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
    )
    """AgentID used for this project. If not set, the project will not work."""

    vector_collection_id: Mapped[int | None] = mapped_column(
        ForeignKey("vector_collections.id", ondelete="SET NULL"),
        nullable=True,
    )
    """VectorCollectionID used for this project. If not set, the agent has no custom knowledge."""

    idle_video_id: Mapped[int | None] = mapped_column(
        ForeignKey("videos.id", ondelete="SET NULL"),
        nullable=True,
    )
    """Idle video used as a default video when no other is playing."""

    enter_video_id: Mapped[int | None] = mapped_column(
        ForeignKey("videos.id", ondelete="SET NULL"),
        nullable=True,
    )
    """Optional video that can be set to play when the user begins interacting with the agent."""

    exit_video_id: Mapped[int | None] = mapped_column(
        ForeignKey("videos.id", ondelete="SET NULL"),
        nullable=True,
    )
    """Optional video that can be set to play when the user exits interacting with the agent."""

    terms: Mapped[str] = mapped_column(nullable=True)
    """Optional speech recognition terms used to improve STT accuracy."""
