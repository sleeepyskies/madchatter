from sqlalchemy import Integer, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.models.agents import Agent
from db.models.scenes_videos import scenes_videos
from db.models.videos import Video


class Scene(Base):
    """
    A Scene represents an agent and a collection of videos together. This allows for agents to be
    reused throughout various scenes without having to redefined their personality.
    """
    __tablename__ = "scenes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    label: Mapped[str] = mapped_column(String(256), nullable=False)
    agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("agents.id", ondelete="SET NULL"),
        nullable=True,
    )
    agent: Mapped["Agent | None"] = relationship("Agent")
    videos: Mapped[list["Video"]] = relationship(
        "Video",
        secondary=scenes_videos,
    )

