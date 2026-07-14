from enum import Enum
from models.agent import AgentResponse
from models.base import BaseSchema
from models.videos import VideoResponse

class STTModel(str, Enum):
    BASE = "base"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE_V2 = "large-v2"
    LARGE_V3 = "large-v3"


class STTDevice(str, Enum):
    CPU = "cpu"
    CUDA = "cuda"


class ProjectResponse(BaseSchema):
    id: int
    label: str
    agent: AgentResponse | None
    videos: list[VideoResponse]
    knowledge_id: int | None
    idle_video: VideoResponse | None
    enter_video: VideoResponse | None
    exit_video: VideoResponse | None
    stt_terms: str | None
    stt_model: STTModel | None
    stt_device: STTDevice | None
    llm_model: str | None


class CreateProjectRequest(BaseSchema):
    label: str
    agent_id: int | None = None
    knowledge_id: int | None = None
    idle_video_id: int | None = None
    enter_video_id: int | None = None
    exit_video_id: int | None = None
    stt_terms: str | None = None
    stt_model: STTModel | None = None
    stt_device: STTDevice | None = None
    llm_model: str | None = None


class UpdateProjectRequest(BaseSchema):
    label: str | None = None
    agent_id: int | None = None
    knowledge_id: int | None = None
    idle_video_id: int | None = None
    enter_video_id: int | None = None
    exit_video_id: int | None = None
    stt_terms: str | None = None
    stt_model: STTModel | None = None
    stt_device: STTDevice | None = None
    llm_model: str | None = None


class ExportProjectResponse(BaseSchema):
    pass


class ImportProjectRequest(BaseSchema):
    pass


class ImportProjectResponse(BaseSchema):
    project_id: int
