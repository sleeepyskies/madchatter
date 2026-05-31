from sqlalchemy import Table, Column, Integer, ForeignKey

from db.base import Base

projects_videos = Table(
    "projects_videos",
    Base.metadata,
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("video_id", Integer, ForeignKey("videos.id"), primary_key=True),
)