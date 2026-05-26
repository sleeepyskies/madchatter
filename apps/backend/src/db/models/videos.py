from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class Video(Base):
    """
    Video Model.
    Videos are stored on disk and not within SQLite. Therefore, the table only holds a filepath and not a blob.
    """
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    """Primary key for Video Model."""
    description: Mapped[str] = mapped_column(String(4096), nullable=False)
    """User defined description of the video."""
    label: Mapped[str] = mapped_column(String(512), nullable=False)
    """User defined name of the video."""
    filename: Mapped[str] = mapped_column(String(36), nullable=False)
    """Backend UUID of the video."""
