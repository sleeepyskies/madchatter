from enum import Enum
from models.base import BaseSchema
from models.videos import VideoResponse

class Mode(str, Enum):
    video_only = "video_only"
    video_and_tts = "video_and_tts"
    tts_only = "tts_only"

class ApplyProjectResponse(BaseSchema):
    project_id: int

class ChatRequest(BaseSchema):
    user_text: str

class ChatModeResponse(BaseSchema):
    mode: Mode
    video_id: int | None = None
    user_text: str | None = None

class VideoPreloadResponse(BaseSchema):
    idle_video: VideoResponse | None =  None
    enter_video: VideoResponse | None = None
    exit_video: VideoResponse | None = None
    videos: list[VideoResponse] | None = None

class LatestReplyResponse(BaseSchema):
    reply: str | None = None
