from sqlalchemy import Table, Column, Integer, ForeignKey

from db.base import Base

# todo(sky): it would actually be best to remove this and have just project_id inside of videos table
projects_videos = Table(
    "projects_videos",
    Base.metadata,
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("video_id", Integer, ForeignKey("videos.id", ondelete="CASCADE"), primary_key=True),
)
