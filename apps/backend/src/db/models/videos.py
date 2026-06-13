from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Video(Base):
    """
    Represents a video saved to disk.
    Videos are saved under settings.files_dir
    """
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    """ID of the row."""

    label: Mapped[str] = mapped_column(nullable=False)
    """User defined label for the video."""

    description: Mapped[str] = mapped_column(nullable=False)
    """User defined description of the video. This is used by the AI pipeline to determine which video to play for a response."""

    filename: Mapped[str] = mapped_column(nullable=False, unique=True)
    """Filename of the video on disk. This is used over videos.label to avoid naming collisions."""

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    """ID of the project this video belongs to."""
