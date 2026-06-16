from fastapi import APIRouter, File
from fastapi import UploadFile
from fastapi.params import Depends, Form
from starlette import status

from api.dependencies import get_video_service
from models.videos import VideoResponse, UpdateVideoRequest, CreateVideoRequest
from services.video_service import VideoService

VIDEO_PREFIX = "/videos"

router = APIRouter(prefix=VIDEO_PREFIX, tags=["videos"])


@router.post("/upload", response_model=VideoResponse)
def upload_video(
        label: str = Form(...),
        description: str = Form(...),
        project_id: int = Form(...),
        file: UploadFile = File(...),
        video_service: VideoService = Depends(get_video_service)
):
    return video_service.upload_video(
        CreateVideoRequest(label=label, description=description, project_id=project_id),
        file
    )


@router.get("", response_model=list[VideoResponse])
def list_videos(video_service: VideoService = Depends(get_video_service)):
    return video_service.list_videos()


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, video_service: VideoService = Depends(get_video_service)):
    return video_service.get_video(video_id)


@router.patch("/{video_id}", response_model=VideoResponse | None)
def update_video(
        video_id: int,
        request: UpdateVideoRequest,
        video_service: VideoService = Depends(get_video_service)
):
    return video_service.update_video(video_id, request)


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(video_id: int, video_service: VideoService = Depends(get_video_service)):
    video_service.delete_video(video_id)
