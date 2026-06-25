from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from api.api_exception import ResourceNotFoundException
from db.models.videos import Video
from models.videos import UpdateVideoRequest


class VideoRepository:
    """Provides access to the database for any Video related operations."""

    def __init__(self, database: Session) -> None:
        self.database = database

    def create(self, video: Video) -> Video:
        self.database.add(video)
        self.database.commit()
        self.database.refresh(video)
        return video

    def get(self, video_id: int) -> Video:
        video = self.database.get(Video, video_id)
        if not video:
            raise ResourceNotFoundException("Videos", video_id)
        return video

    def list_all(self) -> list[Video]:
        return list(self.database.scalars(select(Video)).all())

    def list_for_project(self, project_id: int) -> list[Video]:
        statement = select(Video).where(Video.project_id == project_id)
        return list(self.database.scalars(statement).all())

    def update(self, video_id: int, new: UpdateVideoRequest) -> Video | None:
        video = self.get(video_id)

        if new.label is not None:
            video.label = new.label
        if new.description is not None:
            video.description = new.description
        if new.includes_audio is not None:
            video.includes_audio = new.includes_audio

        self.database.commit()
        self.database.refresh(video)
        return video

    def delete(self, video_id: int) -> None:
        video = self.get(video_id)
        self.database.delete(video)
        self.database.commit()

    def batch_delete(self, video_ids: list[int]) -> None:
        if not video_ids:
            return
        statement = delete(Video).where(Video.id.in_(video_ids))
        self.database.execute(statement)
        self.database.commit()
