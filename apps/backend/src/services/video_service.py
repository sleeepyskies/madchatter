import os
import shutil
import uuid

from fastapi import UploadFile

from api.api_exception import InvalidFileException
from db.models.videos import Video
from repositories.video_repository import VideoRepository, UpdateVideo
from models.videos import SimpleVideoResponse, VideoResponse, UpdateVideoRequest, CreateVideoRequest


class VideoService:
    """Handles video related business logic."""
    VIDEO_DIRECTORY = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "videos"
    )

    def __init__(self, repository: VideoRepository):
        self.repository = repository

    def upload_video(
            self,
            request: CreateVideoRequest,
            file: UploadFile
    ) -> VideoResponse:
        filename = self._save_file(file)

        video = Video(
            description=request.description,
            label=request.label,
            filename=filename,
        )

        created = self.repository.create(video)
        return self._add_file_url(SimpleVideoResponse.model_validate(created))

    def list_videos(self) -> list[VideoResponse]:
        videos = self.repository.list()
        return [self._add_file_url(SimpleVideoResponse.model_validate(video)) for video in videos]

    def get_video(self, video_id: int) -> VideoResponse | None:
        video = self.repository.get(video_id)
        if not video:
            return None
        return self._add_file_url(SimpleVideoResponse.model_validate(video))

    def update_video(
            self,
            video_id: int,
            request: UpdateVideoRequest
    ) -> VideoResponse | None:
        video = self.repository.update(video_id, UpdateVideo(description=request.description, label=request.label))

        if not video:
            return None
        return self._add_file_url(SimpleVideoResponse.model_validate(video))

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
            shutil.copyfileobj(file.file, f)

        return filename

    def _delete_file(self, filename: str) -> None:
        path = os.path.join(self.VIDEO_DIRECTORY, filename)
        if os.path.exists(path):
            os.remove(path)

    def _add_file_url(self, video_response: SimpleVideoResponse) -> VideoResponse:
        """Add file_url to video response. Converts SimpleVideoResponse to VideoResponse with populated file_url."""
        return VideoResponse(
            id=video_response.id,
            label=video_response.label,
            description=video_response.description,
            file_url=f"http://127.0.0.1:8000/videos/{self.repository.get(video_response.id).filename}"
        )
