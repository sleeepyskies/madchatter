from sqlalchemy import Table, Column, Integer, ForeignKey

from db.base import Base

scenes_videos = Table(
    "scenes_videos",
    Base.metadata,
    Column("scene_id", Integer, ForeignKey("scenes.id"), primary_key=True),
    Column("video_id", Integer, ForeignKey("videos.id"), primary_key=True),
)