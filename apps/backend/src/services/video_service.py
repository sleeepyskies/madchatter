import uuid
from pathlib import Path

from fastapi import UploadFile

from api.api_exception import InvalidFileException
from db.models.videos import Video
from models.videos import VideoResponse, UpdateVideoRequest, CreateVideoRequest
from repositories.video_repository import VideoRepository
from settings import settings
from util.download_url import create_download_url
from util.file_handler import FileHandler


def map_db_to_response(video: Video) -> VideoResponse:
    return VideoResponse(
        id=video.id,
        label=video.label,
        description=video.description,
        includes_audio=video.includes_audio,
        download_url=create_download_url(video.filename),
    )

class VideoService:
    """Handles video related business logic."""

    def __init__(self, repository: VideoRepository):
        self.repository = repository
        self.file_handler = FileHandler(settings.files_dir)

    def upload_video(
            self,
            request: CreateVideoRequest,
            file: UploadFile
    ) -> VideoResponse:
        if not file.filename:
            raise InvalidFileException("Missing filename")
        if not file.content_type or not file.content_type.startswith("video/"):
            raise InvalidFileException("Invalid file type")

        ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4().hex}{ext}"

        self.file_handler.save_file(file, unique_filename)

        video = Video(
            label=request.label,
            description=request.description,
            filename=unique_filename,
            project_id=request.project_id,
        )

        created = self.repository.create(video)
        return map_db_to_response(video)

    def list_videos(self) -> list[VideoResponse]:
        videos = self.repository.list_all()
        return [map_db_to_response(video) for video in videos]

    def get_video(self, video_id: int) -> VideoResponse:
        video = self.repository.get(video_id)
        return map_db_to_response(video)

    def update_video(
            self,
            video_id: int,
            request: UpdateVideoRequest
    ) -> VideoResponse:
        video = self.repository.update(video_id, request)
        return map_db_to_response(video)

    def delete_video(self, video_id: int) -> None:
        video = self.repository.get(video_id)
        self.repository.delete(video_id)
        self.file_handler.delete_file(video.filename)
