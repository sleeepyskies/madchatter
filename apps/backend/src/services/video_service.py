import os
import shutil
import uuid

from fastapi import UploadFile
from loguru import logger

from api.api_exception import InvalidFileException
from db.models.videos import Video
from models.videos import SimpleVideoResponse, UpdateVideoRequest, CreateVideoRequest
from repositories.video_repository import VideoRepository, UpdateVideo


class VideoService:
    """Handles video related business logic."""
    VIDEO_DIRECTORY = "./run/videos"

    def __init__(self, repository: VideoRepository):
        self.repository = repository

    def upload_video(
            self,
            request: CreateVideoRequest,
            file: UploadFile
    ) -> SimpleVideoResponse:
        filename = self._save_file(file)

        video = Video(
            description=request.description,
            label=request.label,
            filename=filename,
        )

        created = self.repository.create(video)
        return SimpleVideoResponse.model_validate(created)

    def list_videos(self) -> list[SimpleVideoResponse]:
        videos = self.repository.list()
        return [SimpleVideoResponse.model_validate(video) for video in videos]

    def get_video(self, video_id: int) -> SimpleVideoResponse:
        video = self.repository.get(video_id)
        return SimpleVideoResponse.model_validate(video)

    def update_video(
            self,
            video_id: int,
            request: UpdateVideoRequest
    ) -> SimpleVideoResponse:
        video = self.repository.update(video_id, UpdateVideo(description=request.description,
                                                             label=request.label))
        return SimpleVideoResponse.model_validate(video)

    def delete_video(self, video_id: int) -> None:
        video = self.repository.get(video_id)
        self.repository.delete(video_id)
        self._delete_file(video.filename)

    def _save_file(self, file: UploadFile) -> str:
        os.makedirs(self.VIDEO_DIRECTORY, exist_ok=True)

        if not file.filename:
            raise InvalidFileException("Missing filename")
        if not file.content_type or not file.content_type.startswith("video/"):
            raise InvalidFileException("Invalid file type")

        ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(self.VIDEO_DIRECTORY, filename)

        with open(path, "wb") as f:
            logger.debug(f"Saving {file.filename} to {os.path.abspath(path)}")
            shutil.copyfileobj(file.file, f)

        return filename

    def _delete_file(self, filename: str) -> None:
        path = os.path.join(self.VIDEO_DIRECTORY, filename)
        if os.path.exists(path):
            os.remove(path)
